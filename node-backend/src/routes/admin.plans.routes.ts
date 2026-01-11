import { Router } from "express";
import {
    createPlan,
    getPlans,
    getPlanById,
    updatePlan,
    deletePlan
} from "../controllers/admin.plans.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import { CreatePlanSchema, UpdatePlanSchema } from "../schemas/plan.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Subscription plan management (Admin only mostly)
 */

/**
 * @swagger
 * /plans:
 *   post:
 *     summary: Create a new plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authorize(ActionEnum.CREATE, ResourceEnum.PLAN, ScopeEnum.ALL), validateRequest(CreatePlanSchema), createPlan);

/**
 * @swagger
 * /admin/plans:
 *   get:
 *     summary: Get all plans (Admin)
 *     tags: [Admin Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of plans
 */
router.get("/", authorize(ActionEnum.READ, ResourceEnum.PLAN, ScopeEnum.ALL), getPlans);

/**
 * @swagger
 * /admin/plans/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Admin Plans]
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
 *         description: Plan details
 */
router.get("/:id", authorize(ActionEnum.READ, ResourceEnum.PLAN, ScopeEnum.ALL), getPlanById);

/**
 * @swagger
 * /admin/plans/{id}:
 *   put:
 *     summary: Update a plan
 *     tags: [Admin Plans]
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
 *             $ref: '#/components/schemas/UpdatePlan'
 *     responses:
 *       200:
 *         description: Plan updated
 */
router.put("/:id", authorize(ActionEnum.UPDATE, ResourceEnum.PLAN, ScopeEnum.ALL), validateRequest(UpdatePlanSchema), updatePlan);

/**
 * @swagger
 * /admin/plans/{id}:
 *   delete:
 *     summary: Delete a plan
 *     tags: [Admin Plans]
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
 *         description: Plan deleted
 */
router.delete("/:id", authorize(ActionEnum.DELETE, ResourceEnum.PLAN, ScopeEnum.ALL), deletePlan);

export default router;
