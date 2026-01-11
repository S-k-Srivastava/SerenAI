import { CreateDocumentRequest, UpdateDocumentRequest } from "../../schemas/document.js";
import { IDocumentResponse, IUserDocumentsResponse } from "../../types/index.js";

export interface IUserDocumentsService {
    createDocument(userId: string, data: CreateDocumentRequest): Promise<IDocumentResponse>;
    getDocuments(userId: string, page?: number, limit?: number, search?: string, labels?: string[]): Promise<IUserDocumentsResponse>;
    getUniqueLabels(userId: string): Promise<string[]>;
    getDocumentById(userId: string, documentId: string): Promise<IDocumentResponse>;
    deleteDocument(userId: string, documentId: string): Promise<void>;
    updateDocument(userId: string, documentId: string, data: UpdateDocumentRequest): Promise<IDocumentResponse>;
}
