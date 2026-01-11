import express from "express";
import {
    createSubscription,
    getUserSubscriptions,
    cancelSubscription,
} from "../controllers/admin.subscriptions.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import { CreateSubscriptionSchema } from "../schemas/subscription.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Subscriptions (Admin)
 *   description: Subscription management (Admin only)
 */

router.post("/", authorize(ActionEnum.CREATE, ResourceEnum.SUBSCRIPTION, ScopeEnum.ALL), validateRequest(CreateSubscriptionSchema), createSubscription);
router.get("/user/:userId", authorize(ActionEnum.READ, ResourceEnum.SUBSCRIPTION, ScopeEnum.ALL), getUserSubscriptions);
router.delete("/:id", authorize(ActionEnum.DELETE, ResourceEnum.SUBSCRIPTION, ScopeEnum.ALL), cancelSubscription);

export default router;
