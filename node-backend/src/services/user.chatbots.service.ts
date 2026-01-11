import { IChatBot, ChatbotVisibilityEnum } from "../models/ChatBot.js";
import { NotFoundError, BadRequestError, ForbiddenError } from "../errors/index.js";
import mongoose from "mongoose";
import { CreateChatBotRequest, UpdateChatBotRequest, UpdateVisibilityRequest, ShareChatBotRequest } from "../schemas/chatbot.js";
import { chatbotsRepository } from "../repositories/chatbots.repository.js";
import { documentsRepository } from "../repositories/documents.repository.js";
import { usersRepository } from "../repositories/users.repository.js";

import { IChatBotResponse, IUserChatBotsResponse, IShareChatBotResponse, IChatbotListItem, IChatbotPopulatedUser } from "../types/index.js";
import { IUserChatbotsService } from "./interfaces/IUserChatBotsService.js";
import { extractId } from "../utils/helpers/mongoose.js";

export class UserChatbotsService implements IUserChatbotsService {
    async createChatBot(userId: string, data: CreateChatBotRequest): Promise<IChatBotResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Verify documents belong to user if provided
            if (data.document_ids && data.document_ids.length > 0) {
                const documents = await documentsRepository.find({
                    _id: { $in: data.document_ids },
                    user_id: userId,
                }, { session });

                if (documents.length !== data.document_ids.length) {
                    throw new BadRequestError("Some of the selected documents could not be found or do not belong to user");
                }
            }

            const { document_ids, system_prompt, llm_config_id, ...rest } = data;
            // Handle camelCase from frontend if needed
            const finalSystemPrompt = system_prompt || "";
            const cleanRest = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));

            const chatbot = await chatbotsRepository.create({
                ...cleanRest,
                system_prompt: finalSystemPrompt,
                document_ids: document_ids?.map(id => new mongoose.Types.ObjectId(id)) ?? [],
                user_id: new mongoose.Types.ObjectId(userId),
                ...(llm_config_id ? { llm_config_id: new mongoose.Types.ObjectId(llm_config_id) } : {}),
            }, { session });

            await session.commitTransaction();
            return chatbot;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async getChatBots(userId: string, page: number = 1, limit: number = 10, search?: string): Promise<IUserChatBotsResponse> {
        const skip = (page - 1) * limit;

        const searchFilter = search ? { name: { $regex: search, $options: 'i' } } : {};
        
        const query = {
            $and: [
                searchFilter,
                {
                    $or: [
                        { user_id: new mongoose.Types.ObjectId(userId) },
                        { shared_with: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            ]
        };

        const [bots, total] = await Promise.all([
            chatbotsRepository.findPopulated(query, skip, limit, { createdAt: -1 }),
            chatbotsRepository.count(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        const data: IChatbotListItem[] = bots.map(doc => {
            const obj = doc.toJSON();
            const populatedDoc = doc as unknown as IChatbotPopulatedUser;
            const user = populatedDoc.user_id;
            const isOwner = extractId(user) === userId || extractId(doc.user_id) === userId;

            return {
                ...obj,
                user_id: user._id || doc.user_id,
                owner_name: user && user.firstName ? `${user.firstName} ${user.lastName}` : 'Unknown',
                is_owner: isOwner
            } as IChatbotListItem;
        });

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getChatBotById(userId: string, chatBotId: string): Promise<IChatBotResponse> {
        const chatbot = await chatbotsRepository.findByIdPopulated(chatBotId);

        if (!chatbot) {
            throw new NotFoundError("The requested chatbot could not be found.");
        }

        // Check if user has access (owner or shared)
        const isOwner = extractId(chatbot.user_id) === userId;
        const isShared = chatbot.shared_with.some(id => extractId(id) === userId);
        const isPublic = chatbot.visibility === ChatbotVisibilityEnum.PUBLIC;

        if (!isOwner && !isShared && !isPublic) {
            throw new ForbiddenError("Access denied to this chatbot");
        }

        const chatbotObj = chatbot.toJSON();
        return {
            ...chatbotObj,
            is_owner: isOwner
        } as IChatBotResponse;
    }

    async updateChatBot(userId: string, chatBotId: string, data: UpdateChatBotRequest): Promise<IChatBotResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const chatbot = await chatbotsRepository.findById(chatBotId, { session });

            if (!chatbot) {
                throw new NotFoundError("Cannot update: Chatbot does not exist.");
            }

            if (extractId(chatbot.user_id) !== userId) {
                throw new ForbiddenError("Only the owner can update this chatbot");
            }

            // Verify documents if updating
            if (data.document_ids && data.document_ids.length > 0) {
                const documents = await documentsRepository.find({
                    _id: { $in: data.document_ids },
                    user_id: extractId(chatbot.user_id),
                });

                if (documents.length !== data.document_ids.length) {
                    throw new BadRequestError("Some of the selected documents for update could not be found or are inaccessible.");
                }
            }

            const { document_ids, system_prompt, llm_config_id, ...rest } = data;
            // Handle camelCase from frontend if needed
            const finalSystemPrompt = system_prompt;

            const cleanRest = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));

            const updateData: Partial<IChatBot> = {
                ...cleanRest,
                ...(finalSystemPrompt !== undefined ? { system_prompt: finalSystemPrompt } : {}),
                ...(document_ids ? { document_ids: document_ids.map(id => new mongoose.Types.ObjectId(id)) } : {}),
                ...(llm_config_id ? { llm_config_id: new mongoose.Types.ObjectId(llm_config_id) } : {}),
            };

            const updatedChatbot = await chatbotsRepository.updateById(chatBotId, updateData, { session });
            if (!updatedChatbot) throw new NotFoundError("Update failed");

            await session.commitTransaction();
            return updatedChatbot;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async deleteChatBot(userId: string, chatBotId: string): Promise<void> {
        const chatbot = await chatbotsRepository.findById(chatBotId);
        if (!chatbot) {
            throw new NotFoundError("Chatbot not found");
        }

        if (extractId(chatbot.user_id) !== userId) {
            throw new ForbiddenError("Only the owner can delete this chatbot");
        }

        const deleted = await chatbotsRepository.deleteById(chatBotId);

        if (!deleted) {
            throw new NotFoundError("ChatBot not found");
        }
    }

    async updateVisibility(userId: string, chatBotId: string, data: UpdateVisibilityRequest): Promise<IChatBotResponse> {
        const { visibility } = data;
        const chatbot = await chatbotsRepository.findById(chatBotId);

        if (!chatbot) {
            throw new NotFoundError("ChatBot not found");
        }

        if (extractId(chatbot.user_id) !== userId) {
            throw new ForbiddenError("Only the owner can change visibility");
        }

        const updated = await chatbotsRepository.updateById(chatBotId, { visibility });
        if (!updated) throw new NotFoundError("Update failed");

        return updated;
    }

    async shareChatBot(userId: string, chatBotId: string, data: ShareChatBotRequest): Promise<IShareChatBotResponse> {
        const { emails } = data;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const chatbot = await chatbotsRepository.findById(chatBotId, { session });

            if (!chatbot) {
                throw new NotFoundError("ChatBot not found");
            }

            if (extractId(chatbot.user_id) !== userId) {
                throw new ForbiddenError("Only the owner can share this chatbot");
            }

            // Batch fetch all users by emails in one query instead of loop
            const usersToShare = await usersRepository.find({ email: { $in: emails } }, { session });

            // Create email -> user map for O(1) lookup
            const userMap = new Map(
                usersToShare.map(user => [user.email, user])
            );

            const results = {
                success: [] as string[],
                failed: [] as { email: string, reason: string }[]
            };
            const existingSharedIds = new Set(chatbot.shared_with.map(id => extractId(id)));
            const newSharedUserIds: mongoose.Types.ObjectId[] = [];

            // Process each email
            for (const email of emails) {
                const userToShare = userMap.get(email);

                if (!userToShare) {
                    results.failed.push({ email, reason: "User not found" });
                    continue;
                }

                if (extractId(userToShare as unknown as { _id: mongoose.Types.ObjectId }) === extractId(chatbot.user_id)) {
                    results.failed.push({ email, reason: "Cannot share with owner" });
                    continue;
                }

                const userIdToShare = extractId(userToShare as unknown as { _id: mongoose.Types.ObjectId });

                // Check if already shared
                if (!existingSharedIds.has(userIdToShare)) {
                    newSharedUserIds.push(userToShare._id as mongoose.Types.ObjectId);
                    existingSharedIds.add(userIdToShare);
                }

                results.success.push(email);
            }

            if (results.failed.length > 0) {
                const reason = results.failed[0]!.reason;
                throw new BadRequestError(reason);
            }

            // Update chatbot if there are new shared users
            if (newSharedUserIds.length > 0 || results.success.length > 0) {
                const updatedSharedWith = [...chatbot.shared_with, ...newSharedUserIds];
                const visibility = chatbot.visibility === ChatbotVisibilityEnum.PRIVATE ? ChatbotVisibilityEnum.SHARED : chatbot.visibility;

                await chatbotsRepository.updateById(chatBotId, {
                    shared_with: updatedSharedWith,
                    visibility
                }, { session });
            }

            await session.commitTransaction();

            const updatedChatbot = await chatbotsRepository.findById(chatBotId, { session });

            return {
                results,
                chatbot: updatedChatbot
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
