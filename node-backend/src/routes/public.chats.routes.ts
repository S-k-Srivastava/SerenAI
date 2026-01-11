import { Router } from "express";
import {
  getChatbot,
  startConversation,
  sendMessage,
} from "../controllers/public.chats.controller.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import { PublicChatRequestSchema } from "../schemas/chat.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Public Chat
 *   description: Public chatbot interactions (no authentication required)
 */

/**
 * @swagger
 * /public/chat/{chatbotId}:
 *   get:
 *     summary: Get public chatbot details
 *     tags: [Public Chat]
 *     parameters:
 *       - in: path
 *         name: chatbotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chatbot details
 *       403:
 *         description: Chatbot is not public
 *       404:
 *         description: Chatbot not found
 */
router.get("/:chatbotId", getChatbot);

/**
 * @swagger
 * /public/chat/{sessionId}/{chatbotId}/start:
 *   post:
 *     summary: Start a public conversation with a chatbot
 *     tags: [Public Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chatbotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation started
 *       403:
 *         description: Chatbot is not public
 *       404:
 *         description: Chatbot not found
 */
router.post("/:sessionId/:chatbotId/start", startConversation);

/**
 * @swagger
 * /public/chat/{sessionId}/{conversationId}/message:
 *   post:
 *     summary: Send a message to a public conversation
 *     tags: [Public Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: conversationId
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
 *       403:
 *         description: Access denied or chatbot is not public
 *       404:
 *         description: Conversation not found
 */
router.post("/:sessionId/:conversationId/message", validateRequest(PublicChatRequestSchema), sendMessage);

export default router;
