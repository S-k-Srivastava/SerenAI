import { Request, Response } from "express";
import { UserDocumentsService } from "../services/user.documents.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/helpers/responseHelper.js";
import { CreateDocumentRequest } from "../schemas/document.js";

const documentService = new UserDocumentsService();

export const createDocument = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateDocumentRequest = req.body;
    const userId = req.user!.id;

    const document = await documentService.createDocument(userId, data);

    sendCreated(res, { document }, `Document "${document.name}" added successfully`);
});

export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const labels = req.query.labels ? (req.query.labels as string).split(',') : undefined;

    const result = await documentService.getDocuments(userId, page, limit, search, labels);

    sendSuccess(res, result, "Documents retrieved successfully");
});

export const getLabels = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const labels = await documentService.getUniqueLabels(userId);
    sendSuccess(res, { labels }, "Labels retrieved successfully");
});

export const getDocumentById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const docId = id || "";

    const document = await documentService.getDocumentById(userId, docId);

    sendSuccess(res, { document }, "Document retrieved successfully");
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const docId = id || "";

    await documentService.deleteDocument(userId, docId);

    sendSuccess(res, null, "Document has been deleted successfully");
});

export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const docId = id || "";
    const data = req.body;

    const document = await documentService.updateDocument(userId, docId, data);

    sendSuccess(res, { document }, `Document "${document.name}" updated successfully`);
});
