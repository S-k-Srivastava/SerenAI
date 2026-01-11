import { vectorService } from "../ai/vector.service.js";
import { IChunkResponse } from "../ai/interfaces/IVectorService.js";
import { NotFoundError } from "../errors/index.js";
import mongoose from "mongoose";
import { documentsRepository } from "../repositories/documents.repository.js";
import { IDocumentResponse, IUserDocumentsResponse } from "../types/index.js";
import { CreateDocumentRequest, UpdateDocumentRequest } from "../schemas/document.js";
import { IDocument, DocumentVisibilityEnum } from "../models/Document.js";

import { IUserDocumentsService } from "./interfaces/IUserDocumentsService.js";

export class UserDocumentsService implements IUserDocumentsService {
    async createDocument(
        userId: string,
        data: CreateDocumentRequest
    ): Promise<IDocumentResponse> {
        // 1. Create document in MongoDB (Pending status)
        let document = await documentsRepository.create({
            name: data.name,
            user_id: new mongoose.Types.ObjectId(userId),
            description: data.description,
            labels: data.labels || [],
            visibility: data.visibility || "Private",
            metadata: {
                status: "pending",
                chunk_count: 0,
            },
        });

        try {
            const documentId = (document._id as mongoose.Types.ObjectId).toString();

            // 2. Prepare chunks with metadata for indexing
            const chunkTexts = data.chunks.map(chunk => chunk.content);
            const chunkMetadata = data.chunks.map(chunk => ({
                document_id: documentId,
                user_id: userId,
                chunk_id: chunk.id,
                chunk_index: chunk.index,
                created_at: new Date().toISOString(),
            }));

            // 3. Call Vector Service to index chunks
            await vectorService.indexDocuments(chunkTexts, chunkMetadata);

            // 4. Update document status
            const updated = await documentsRepository.updateById(documentId, {
                "metadata.status": "indexed",
                "metadata.chunk_count": data.chunks.length
            });
            if (updated) document = updated;

            return document;
        } catch (error) {
            await documentsRepository.updateById((document._id as mongoose.Types.ObjectId).toString(), {
                "metadata.status": "failed"
            });
            throw error;
        }
    }

    async getDocuments(
        userId: string,
        page: number = 1,
        limit: number = 10,
        search?: string,
        labels?: string[]
    ): Promise<IUserDocumentsResponse> {
        const { documents, total } = await documentsRepository.findByUser(userId, page, limit, search, labels);
        return {
            data: documents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getUniqueLabels(userId: string): Promise<string[]> {
        return await documentsRepository.findUniqueLabels(userId);
    }

    async getDocumentById(userId: string, documentId: string): Promise<IDocumentResponse & { chunks?: IChunkResponse[]; is_owner?: boolean }> {
        const document = await documentsRepository.findById(documentId);

        if (!document) {
            throw new NotFoundError("The requested document could not be found.");
        }

        // Check if user is the owner or document is public
        const isOwner = document.user_id.toString() === userId;
        if (!isOwner && document.visibility !== DocumentVisibilityEnum.PUBLIC) {
            throw new NotFoundError("The requested document could not be found or you don't have permission to access it.");
        }

        // Retrieve chunks from vector database
        try {
            const chunks = await vectorService.getChunksByDocumentId(documentId);
            return {
                ...document.toObject(),
                chunks,
                is_owner: isOwner
            };
        } catch (error) {
            console.error("Failed to retrieve chunks", error);
            return {
                ...document.toObject(),
                is_owner: isOwner
            };
        }
    }

    async deleteDocument(userId: string, documentId: string): Promise<void> {
        const document = await documentsRepository.findOne({
            _id: documentId,
            user_id: userId,
        });

        if (!document) {
            throw new NotFoundError("Document not found");
        }

        // 1. Delete from Vector Store
        try {
            await vectorService.deleteDocuments({
                document_id: { $in: [documentId] }
            });
        } catch (error) {
            console.error("Failed to delete from Vector Store", error);
        }

        // 2. Delete from Node
        await documentsRepository.deleteById(documentId);
    }

    async updateDocument(
        userId: string,
        documentId: string,
        data: UpdateDocumentRequest
    ): Promise<IDocumentResponse> {
        const document = await documentsRepository.findOne({
            _id: documentId,
            user_id: userId,
        });

        if (!document) {
            throw new NotFoundError("Cannot update: The document does not exist or access is denied.");
        }

        const updates: Partial<IDocument> = {};
        if (data.name) updates.name = data.name;
        if (data.description !== undefined) updates.description = data.description;
        if (data.labels) updates.labels = data.labels;
        if (data.visibility) updates.visibility = data.visibility;

        // Apply updates - content editing is not supported
        if(Object.keys(updates).length > 0) {
             await documentsRepository.updateById(documentId, updates);
        }

        // Return latest
        const finalDoc = await documentsRepository.findById(documentId);
        return finalDoc!;
    }
}

export const userDocumentsService = new UserDocumentsService();
