import { Router } from "express";
import { getPublicPlans } from "../controllers/public.plans.controller.js";

const router = Router();

/**
 * @swagger
 * /plans/public:
 *   get:
 *     summary: Get all active plans (Public)
 *     tags: [Plans]
 */
router.get("/", getPublicPlans);

export default router;
