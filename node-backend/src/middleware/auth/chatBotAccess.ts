import { Request, Response, NextFunction } from "express";
import ChatBot, { ChatbotVisibilityEnum } from "../../models/ChatBot.js";
import { AppError } from "../../errors/index.js";
import { asyncHandler } from "../../utils/helpers/asyncHandler.js";

/**
 * Middleware to verify if the user has access to the ChatBot.
 * Rules:
 * 1. Owner: ALLOW
 * 2. Public: ALLOW
 * 3. Shared: ALLOW if user ID in shared_with
 * 4. Otherwise: DENY (403)
 */
export const verifyChatBotAccess = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const { chatbotId, id } = req.params;
    const targetId = chatbotId || id;
    const userId = req.user?.id; // May be undefined if not authenticated (though detailed design said auth required)

    // In this project, ALL access requires login (per user's latest request).
    // The 'authenticate' middleware typically runs before this.
    // We double check here for robust typing.
    if (!userId) {
        throw new AppError("Authentication required to access ChatBots", 401);
    }

    const chatbot = await ChatBot.findById(targetId);
    if (!chatbot) {
        throw new AppError("ChatBot not found", 404);
    }

    // 1. Owner Check
    if (chatbot.user_id.toString() === userId) {
        return next();
    }

    // 2. Public Check
    if (chatbot.visibility === ChatbotVisibilityEnum.PUBLIC) {
        return next();
    }

    // 3. Shared Check
    if (chatbot.visibility === ChatbotVisibilityEnum.SHARED) {
        // Check if user is in shared_with array
        const isShared = chatbot.shared_with.some(
            (id) => id.toString() === userId
        );
        if (isShared) {
            return next();
        }
    }

    // 4. Default Fail
    throw new AppError("You do not have permission to access this ChatBot", 403);
});

/**
 * Middleware to verify OWNER access only (for updating/deleting/sharing).
 */
export const verifyChatBotOwner = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const { id } = req.params; // or chatbotId depending on route
    const chatbotId = id || req.params.chatbotId;

    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Authentication required", 401);
    }

    const chatbot = await ChatBot.findById(chatbotId);
    if (!chatbot) {
        throw new AppError("ChatBot not found", 404);
    }

    if (chatbot.user_id.toString() !== userId) {
        throw new AppError("Only the owner can perform this action", 403);
    }

    next();
});
