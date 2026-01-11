import { Router } from "express";
import {
  getAllConversations,
  updateConversationTitle,
  startConversation,
  getConversation,
  sendMessageToConversation,
  deleteConversation,
} from "../controllers/user.chats.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import {
  ChatRequestSchema,
  UpdateConversationTitleSchema,
} from "../schemas/chat.js";
import { verifyChatBotAccess } from "../middleware/auth/chatBotAccess.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

const router = Router();

// Chat routes
// Apply authenticate first, then verifyChatBotAccess for specific chatbot routes

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat interactions
 */

/**
 * @swagger
 * /chat/{chatbotId}/start:
 *   post:
 *     summary: Start a conversation with a chatbot
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatbotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation started
 */
router.post("/:chatbotId/start", authenticate, authorize(ActionEnum.READ, ResourceEnum.CHATBOT, ScopeEnum.SELF), verifyChatBotAccess, startConversation);

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get all conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get("/", authenticate, authorize(ActionEnum.READ, ResourceEnum.CHATBOT, ScopeEnum.SELF), getAllConversations);

/**
 * @swagger
 * /chat/conversations/{id}:
 *   get:
 *     summary: Get specific conversation history
 *     tags: [Chat]
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
 *         description: Conversation history
 */
router.get("/conversations/:id", authenticate, authorize(ActionEnum.READ, ResourceEnum.CHAT, ScopeEnum.SELF), getConversation);

/**
 * @swagger
 * /chat/conversations/{id}/message:
 *   post:
 *     summary: Send a message to a specific conversation
 *     tags: [Chat]
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
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent and response received
 */
router.post("/conversations/:id/message", authenticate, authorize(ActionEnum.UPDATE, ResourceEnum.CHAT, ScopeEnum.SELF), validateRequest(ChatRequestSchema), sendMessageToConversation);

/**
 * @swagger
 * /chat/conversations/{id}:
 *   delete:
 *     summary: Delete a specific conversation
 *     tags: [Chat]
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
 *         description: Conversation deleted
 */
router.delete("/conversations/:id", authenticate, authorize(ActionEnum.DELETE, ResourceEnum.CHAT, ScopeEnum.SELF), deleteConversation);

/**
 * @swagger
 * /chat/conversations/{id}/title:
 *   patch:
 *     summary: Update conversation title
 *     tags: [Chat]
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
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Title updated
 */
router.patch("/conversations/:id/title", authenticate, authorize(ActionEnum.UPDATE, ResourceEnum.CHATBOT, ScopeEnum.SELF), validateRequest(UpdateConversationTitleSchema), updateConversationTitle);

export default router;
