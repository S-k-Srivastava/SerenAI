import { Router } from "express";
import {
    createChatBot,
    getChatBots,
    getChatBotById,
    updateChatBot,
    deleteChatBot,
    updateVisibility,
    shareChatBot
} from "../controllers/user.chatbots.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { verifyChatBotAccess, verifyChatBotOwner } from "../middleware/auth/chatBotAccess.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import {
    CreateChatBotSchema,
    UpdateChatBotSchema,
    UpdateVisibilitySchema,
    ShareChatBotSchema
} from "../schemas/chatbot.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";
// import { checkQuota, QuotaEnum } from "../middleware/subscription/quotaMiddleware.js";

const router = Router();

router.use(authenticate);

// Permission routes - Specific routes must come before generic parameter routes
router.patch("/:id/visibility", authorize(ActionEnum.UPDATE, ResourceEnum.CHATBOT, ScopeEnum.SELF), verifyChatBotOwner, validateRequest(UpdateVisibilitySchema), updateVisibility);
router.post("/:id/share", authorize(ActionEnum.UPDATE, ResourceEnum.CHATBOT, ScopeEnum.SELF), verifyChatBotOwner, /* checkQuota(QuotaEnum.CHATBOT_SHARE), */ validateRequest(ShareChatBotSchema), shareChatBot);

/**
 * @swagger
 * tags:
 *   name: ChatBots
 *   description: ChatBot configuration and management
 */

/**
 * @swagger
 * /chatbots:
 *   post:
 *     summary: Create a new chatbot
 *     tags: [ChatBots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               document_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               config:
 *                 type: object
 *                 properties:
 *                   temperature:
 *                     type: number
 *                   system_prompt:
 *                     type: string
 *     responses:
 *       201:
 *         description: ChatBot created
 *       400:
 *         description: Invalid input
 */
/**
 * ... swagger docs ...
 */
router.post("/", authorize(ActionEnum.CREATE, ResourceEnum.CHATBOT, ScopeEnum.SELF), /* checkQuota(QuotaEnum.CHATBOT), */ validateRequest(CreateChatBotSchema), createChatBot);

/**
 * @swagger
 * /chatbots:
 *   get:
 *     summary: Get all chatbots
 *     tags: [ChatBots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of chatbots
 */
router.get("/", authorize(ActionEnum.READ, ResourceEnum.CHATBOT, ScopeEnum.SELF), getChatBots);

/**
 * @swagger
 * /chatbots/{id}:
 *   get:
 *     summary: Get chatbot by ID
 *     tags: [ChatBots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ChatBot details
 *       404:
 *         description: ChatBot not found
 */
router.get("/:id", authorize(ActionEnum.READ, ResourceEnum.CHATBOT, ScopeEnum.SELF), verifyChatBotAccess, getChatBotById);

/**
 * @swagger
 * /chatbots/{id}:
 *   put:
 *     summary: Update chatbot
 *     tags: [ChatBots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               document_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               config:
 *                 type: object
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: ChatBot updated
 *       404:
 *         description: ChatBot not found
 */
router.patch("/:id", authorize(ActionEnum.UPDATE, ResourceEnum.CHATBOT, ScopeEnum.SELF), verifyChatBotOwner, validateRequest(UpdateChatBotSchema), updateChatBot);


/**
 * @swagger
 * /chatbots/{id}:
 *   delete:
 *     summary: Delete chatbot
 *     tags: [ChatBots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ChatBot deleted
 *       404:
 *         description: ChatBot not found
 */
router.delete("/:id", authorize(ActionEnum.DELETE, ResourceEnum.CHATBOT, ScopeEnum.SELF), verifyChatBotOwner, deleteChatBot);

export default router;
