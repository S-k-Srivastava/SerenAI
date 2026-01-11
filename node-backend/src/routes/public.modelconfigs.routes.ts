import { Router } from "express";
import { getPublicModelConfigs } from "../controllers/public.modelconfigs.controller.js";

const router = Router();

/**
 * @route GET /api/v1/model-configs/public
 * @desc Get available LLM and Embedding providers with descriptions
 * @access Public
 */
router.get("/", getPublicModelConfigs);

export default router;
