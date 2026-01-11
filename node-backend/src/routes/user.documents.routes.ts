import { Router } from "express";
import {
    createDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
    updateDocument,
    getLabels,
} from "../controllers/user.documents.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import { CreateDocumentSchema, UpdateDocumentSchema } from "../schemas/document.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";
// import { checkQuota, QuotaEnum } from "../middleware/subscription/quotaMiddleware.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management
 */

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document created
 *       400:
 *         description: Invalid input
 */


/**
 * ... swagger docs ...
 */
router.post("/", authorize(ActionEnum.CREATE, ResourceEnum.DOCUMENT, ScopeEnum.SELF), /* checkQuota(QuotaEnum.DOCUMENT), */ validateRequest(CreateDocumentSchema), createDocument);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents with pagination
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get("/", authorize(ActionEnum.READ, ResourceEnum.DOCUMENT, ScopeEnum.SELF), getDocuments);

/**
 * @swagger
 * /documents/labels:
 *   get:
 *     summary: Get unique document labels
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of labels
 */
router.get("/labels", authorize(ActionEnum.READ, ResourceEnum.DOCUMENT, ScopeEnum.SELF), getLabels);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
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
 *         description: Document details
 *       404:
 *         description: Document not found
 */
router.get("/:id", authorize(ActionEnum.READ, ResourceEnum.DOCUMENT, ScopeEnum.SELF), getDocumentById);

/**
 * @swagger
 * /documents/{id}:
 *   patch:
 *     summary: Update document
 *     tags: [Documents]
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
 *         description: Document updated
 *       404:
 *         description: Document not found
 */
router.patch("/:id", authorize(ActionEnum.UPDATE, ResourceEnum.DOCUMENT, ScopeEnum.SELF), validateRequest(UpdateDocumentSchema), updateDocument);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
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
 *         description: Document deleted
 *       404:
 *         description: Document not found
 */
router.delete("/:id", authorize(ActionEnum.DELETE, ResourceEnum.DOCUMENT, ScopeEnum.SELF), deleteDocument);

export default router;
