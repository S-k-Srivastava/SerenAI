import { Router } from "express";
import { getStats } from "../controllers/user.dashboard.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/", authenticate, authorize(ActionEnum.READ, ResourceEnum.DASHBOARD, ScopeEnum.SELF), getStats);

export default router;
