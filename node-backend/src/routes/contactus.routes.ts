import { Router } from "express";
import { createContactUs } from "../controllers/contactus.controller.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import { CreateContactUsSchema } from "../schemas/contactus.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Contact Us
 *   description: Public contact form submission
 */

/**
 * @swagger
 * /contact-us:
 *   post:
 *     summary: Submit a contact form (Public - No authentication required)
 *     tags: [Contact Us]
 */
router.post("/", validateRequest(CreateContactUsSchema), createContactUs);

export default router;
