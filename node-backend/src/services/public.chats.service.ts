import { IPublicChatsService, IPublicConversationResponse } from "./interfaces/IPublicChatsService.js";
import { IChatResponse } from "../types/index.js";
import { IPublicConversation } from "../models/PublicConversation.js";
import { ChatbotVisibilityEnum, IChatBot } from "../models/ChatBot.js";
import { chatbotsRepository } from "../repositories/chatbots.repository.js";
import { publicConversationsRepository } from "../repositories/publicConversations.repository.js";
import { ragService } from "../ai/rag.service.js";
import { NotFoundError, ForbiddenError, AppError } from "../errors/index.js";
import mongoose from "mongoose";
import { ILLMConfig } from "../models/LLMConfig.js";

export class PublicChatsService implements IPublicChatsService {
    async getChatbot(chatbotId: string): Promise<IChatBot> {
        // Query database with PUBLIC visibility check
        const chatbot = await chatbotsRepository.findOne({
            _id: chatbotId,
            visibility: ChatbotVisibilityEnum.PUBLIC
        });

        if (!chatbot) {
            throw new NotFoundError("Public chatbot not found");
        }

        return chatbot;
    }

    async startConversation(sessionId: string, chatbotId: string): Promise<IPublicConversationResponse> {
        const chatbot = await chatbotsRepository.findById(chatbotId);
        if (!chatbot) throw new NotFoundError("Chatbot not found");

        // Verify chatbot is PUBLIC
        if (chatbot.visibility !== ChatbotVisibilityEnum.PUBLIC) {
            throw new ForbiddenError("This chatbot is not publicly accessible");
        }

        // Check if conversation already exists for this session
        const existing = await publicConversationsRepository.findBySessionAndChatBot(sessionId, chatbotId);
        if (existing) {
            return existing as IPublicConversationResponse;
        }

        // Create new conversation
        const conversation = await publicConversationsRepository.create({
            session_id: sessionId,
            chatbot_owner_id: chatbot.user_id,
            chatbot_id: new mongoose.Types.ObjectId(chatbotId),
            messages: [],
            title: `${chatbot.name}`
        });

        return conversation as IPublicConversationResponse;
    }

    async sendMessage(sessionId: string, conversationId: string, message: string): Promise<IChatResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get conversation
            const conversation = await publicConversationsRepository.findById(conversationId, { session });

            if (!conversation) throw new NotFoundError("Conversation not found");
            if (conversation.session_id !== sessionId) throw new ForbiddenError("Access denied");

            // Get chatbot with LLM config
            const chatbot = await chatbotsRepository.findById(conversation.chatbot_id.toString(), {
                session,
                populate: { path: 'llm_config_id' }
            });

            if (!chatbot) throw new NotFoundError("Chatbot not found");

            // Verify chatbot is PUBLIC
            if (chatbot.visibility !== ChatbotVisibilityEnum.PUBLIC) {
                throw new ForbiddenError("This chatbot is not publicly accessible");
            }

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

            // Use chatbot owner's userId for RAG service
            const chatbotOwnerId = conversation.chatbot_owner_id.toString();

            const result = await ragService.chat({
                question: message,
                history: history,
                documentFilter: { document_id: { $in: docIds } },
                systemPrompt: chatbot.system_prompt,
                userId: chatbotOwnerId,
                session: session,
                llmConfig: llmConfig,
                temperature: chatbot.temperature,
                maxTokens: chatbot.max_tokens
            });

            // Update Conversation with new messages
            await publicConversationsRepository.updateById(conversationId, {
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
            } as unknown as Partial<IPublicConversation>, { session });

            await session.commitTransaction();

            return {
                response: result.response,
                sources: chatbot.view_source_documents ? result.sources : [],
                conversationId: conversationId
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}

export const publicChatsService = new PublicChatsService();
