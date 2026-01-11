import { IUserChatsService } from "./interfaces/IUserChatsService.js";
import { IConversationResponse, IChatResponse, IConversationHistoryResponse, IUserConversationsResponse, IConversationWithDetails, IConversationListItem, IConversationPopulatedChatbot } from "../types/index.js";
import { IConversation, IMessage } from "../models/Conversation.js";
import { ChatbotVisibilityEnum } from "../models/ChatBot.js";
import { chatbotsRepository } from "../repositories/chatbots.repository.js";
import { conversationsRepository } from "../repositories/conversations.repository.js";
import { ragService } from "../ai/rag.service.js";
import { NotFoundError, ForbiddenError, AppError } from "../errors/index.js";
import mongoose, { FilterQuery } from "mongoose";
import { UpdateConversationTitleRequest } from "../schemas/chat.js";
import { extractId } from "../utils/helpers/mongoose.js";
import { ILLMConfig } from "../models/LLMConfig.js";

export class UserChatsService implements IUserChatsService {
    async startNewConversation(userId: string, chatbotId: string): Promise<IConversationResponse> {
        const chatbot = await chatbotsRepository.findById(chatbotId);
        if (!chatbot) throw new NotFoundError("Chatbot not found");

        // Permission check
        const isOwner = extractId(chatbot.user_id) === userId;
        const isShared = chatbot.shared_with.some(id => extractId(id) === userId);
        const isPublic = chatbot.visibility === ChatbotVisibilityEnum.PUBLIC;

        if (!isOwner && !isShared && !isPublic) {
            throw new ForbiddenError("Access denied to this chatbot");
        }

        return await conversationsRepository.create({
            user_id: new mongoose.Types.ObjectId(userId),
            chatbot_id: new mongoose.Types.ObjectId(chatbotId),
            messages: [],
            title: `${chatbot.name}`
        });
    }

    async chatWithConversationId(userId: string, conversationId: string, message: string): Promise<IChatResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Sequential queries to avoid transaction number conflicts
            const conversation = await conversationsRepository.findById(conversationId, { session });

            if (!conversation) throw new NotFoundError("Conversation not found");
            if (extractId(conversation.user_id) !== userId) throw new ForbiddenError("Access denied");

            const chatbot = await chatbotsRepository.findById(conversation.chatbot_id.toString(), {
                session,
                populate: { path: 'llm_config_id' }
            });

            if (!chatbot) throw new NotFoundError("Chatbot not found");

            // Get LLM Config
            const llmConfig = chatbot.llm_config_id as unknown as ILLMConfig;
            if (!llmConfig || !llmConfig._id) {
                throw new AppError("Chatbot does not have a valid LLM configuration", 400);
            }

            // Verify chatbot has documents
            const docIds = chatbot.document_ids.map(id => id.toString());
            if (docIds.length === 0) {
                throw new AppError("Chatbot must have at least one document", 400);
            }

            const history = conversation.messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const result = await ragService.chat({
                question: message,
                history: history,
                documentFilter: { document_id: { $in: docIds } },
                systemPrompt: chatbot.system_prompt,
                userId: userId,
                session: session,
                llmConfig: llmConfig,
                temperature: chatbot.temperature,
                maxTokens: chatbot.max_tokens
            });

            // Update Conversation with new messages
            await conversationsRepository.updateById(conversationId, {
                $push: {
                    messages: {
                        $each: [
                        { role: "user", content: message, timestamp: new Date() },
                            {
                                role: "assistant",
                                content: result.response,
                                chunk_ids: result.sources.map(s => s.chunk_id),
                                timestamp: new Date()
                            }
                        ]
                    }
                }
            } as unknown as Partial<IConversation>, { session });

            await session.commitTransaction();

            return {
                response: result.response,
                sources: result.sources,
                conversationId: conversationId
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async getAllConversations(userId: string, page: number = 1, limit: number = 10, search?: string): Promise<IUserConversationsResponse> {
         const skip = (page - 1) * limit;
         const filter = { user_id: userId };

         if (search) {
             (filter as FilterQuery<IConversation>).title = { $regex: search, $options: 'i' };
         }

         const [conversations, total] = await Promise.all([
             conversationsRepository.find(filter, {
                 skip,
                 limit,
                 sort: { updatedAt: -1 },
                 populate: { path: 'chatbot_id', select: 'name' }
             }),
             conversationsRepository.count(filter)
         ]);

         const items: IConversationListItem[] = conversations.map(c => {
             const cObj = c.toObject();
             const populatedObj = cObj as unknown as IConversationPopulatedChatbot;
             const chatbot = populatedObj.chatbot_id;
             return {
                 _id: (cObj._id as mongoose.Types.ObjectId).toString(),
                 title: cObj.title,
                 chatbot: chatbot ? { name: chatbot.name, _id: chatbot._id.toString() } : null,
                 messages: cObj.messages,
                 last_message_at: cObj.messages?.length > 0 ? cObj.messages[cObj.messages.length - 1].timestamp : cObj.updatedAt
             };
         });

         return {
             data: items,
             pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
             }
         };
    }

    async updateConversationTitle(userId: string, conversationId: string, data: UpdateConversationTitleRequest): Promise<IConversationResponse> {
        const { title } = data;
        const conversation = await conversationsRepository.findById(conversationId);
        if (!conversation) throw new NotFoundError("Conversation not found");
        if (extractId(conversation.user_id) !== userId) throw new ForbiddenError("Access denied");

        const updated = await conversationsRepository.updateById(conversationId, { title });
        if(!updated) throw new NotFoundError("Update failed");
        return updated;
    }

    async getConversation(userId: string, conversationId: string): Promise<IConversationHistoryResponse> {
        const conversation = await conversationsRepository.findById(conversationId);
        if (!conversation) throw new NotFoundError("Conversation not found");
        if (extractId(conversation.user_id) !== userId) throw new ForbiddenError("Access denied");

        const chatbot = await chatbotsRepository.findById(conversation.chatbot_id.toString());
        
        const conversationObj = conversation.toObject();
        const messages = conversationObj.messages as IMessage[];

        const messagesWithSources = await ragService.hydrateMessages(messages);
        
        conversationObj.messages = messagesWithSources as IMessage[];

        return {
            ...conversationObj,
            chatbot: chatbot ? chatbot.toObject() : null
        } as unknown as IConversationWithDetails;
    }

    async deleteConversation(userId: string, conversationId: string): Promise<void> {
        const conversation = await conversationsRepository.findById(conversationId);
        if (!conversation) throw new NotFoundError("Conversation not found");
        if (extractId(conversation.user_id) !== userId) throw new ForbiddenError("Access denied");

        await conversationsRepository.deleteById(conversationId);
    }
}

export const userChatsService = new UserChatsService();
