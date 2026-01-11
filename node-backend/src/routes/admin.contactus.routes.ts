import { Router } from "express";
import {
  getContactUsSubmissions,
  getContactUsById,
  updateContactUsStatus,
} from "../controllers/admin.contactus.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import {
  UpdateContactUsStatusSchema,
  GetContactUsQuerySchema,
} from "../schemas/contactus.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Admin - Contact Us
 *   description: Admin management of contact form submissions
 */

/**
 * @swagger
 * /admin/contact-us:
 *   get:
 *     summary: Get all contact submissions
 *     tags: [Admin - Contact Us]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  authorize(ActionEnum.READ, ResourceEnum.CONTACT_US, ScopeEnum.ALL),
  validateRequest(GetContactUsQuerySchema),
  getContactUsSubmissions
);

/**
 * @swagger
 * /admin/contact-us/{id}:
 *   get:
 *     summary: Get contact submission by ID
 *     tags: [Admin - Contact Us]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id",
  authorize(ActionEnum.READ, ResourceEnum.CONTACT_US, ScopeEnum.ALL),
  getContactUsById
);

/**
 * @swagger
 * /admin/contact-us/{id}/status:
 *   patch:
 *     summary: Update contact submission status
 *     tags: [Admin - Contact Us]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/status",
  authorize(ActionEnum.UPDATE, ResourceEnum.CONTACT_US, ScopeEnum.ALL),
  validateRequest(UpdateContactUsStatusSchema),
  updateContactUsStatus
);

export default router;
