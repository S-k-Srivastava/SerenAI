import { Router } from "express";
import {
    createLLMConfig,
    getLLMConfigs,
    getLLMConfigById,
    updateLLMConfig,
    deleteLLMConfig
} from "../controllers/user.llmconfigs.controller.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { CreateLLMConfigSchema, UpdateLLMConfigSchema } from "../schemas/llmconfig.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /llmconfigs:
 *   post:
 *     summary: Create a new LLM configuration
 *     tags: [LLM Configurations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model_name
 *               - api_key
 *             properties:
 *               model_name:
 *                 type: string
 *               provider:
 *                 type: string
 *                 enum: [OPENAI]
 *               api_key:
 *                 type: string
 *     responses:
 *       201:
 *         description: LLM configuration created successfully
 */
router.post(
    "/",
    authorize(ActionEnum.CREATE, ResourceEnum.LLM_CONFIG, ScopeEnum.SELF),
    validateRequest(CreateLLMConfigSchema),
    createLLMConfig
);

/**
 * @swagger
 * /llmconfigs:
 *   get:
 *     summary: Get all LLM configurations for the user
 *     tags: [LLM Configurations]
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
 *         description: LLM configurations retrieved successfully
 */
router.get(
    "/",
    authorize(ActionEnum.READ, ResourceEnum.LLM_CONFIG, ScopeEnum.SELF),
    getLLMConfigs
);

/**
 * @swagger
 * /llmconfigs/{id}:
 *   get:
 *     summary: Get LLM configuration by ID
 *     tags: [LLM Configurations]
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
 *         description: LLM configuration retrieved successfully
 */
router.get(
    "/:id",
    authorize(ActionEnum.READ, ResourceEnum.LLM_CONFIG, ScopeEnum.SELF),
    getLLMConfigById
);

/**
 * @swagger
 * /llmconfigs/{id}:
 *   put:
 *     summary: Update LLM configuration
 *     tags: [LLM Configurations]
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
 *               model_name:
 *                 type: string
 *               provider:
 *                 type: string
 *                 enum: [OPENAI]
 *               api_key:
 *                 type: string
 *     responses:
 *       200:
 *         description: LLM configuration updated successfully
 */
router.put(
    "/:id",
    authorize(ActionEnum.UPDATE, ResourceEnum.LLM_CONFIG, ScopeEnum.SELF),
    validateRequest(UpdateLLMConfigSchema),
    updateLLMConfig
);

/**
 * @swagger
 * /llmconfigs/{id}:
 *   delete:
 *     summary: Delete LLM configuration
 *     tags: [LLM Configurations]
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
 *         description: LLM configuration deleted successfully
 */
router.delete(
    "/:id",
    authorize(ActionEnum.DELETE, ResourceEnum.LLM_CONFIG, ScopeEnum.SELF),
    deleteLLMConfig
);

export default router;
