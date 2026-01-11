import mongoose, { QueryOptions, ClientSession } from "mongoose";
import { BaseRepository } from "./BaseRepository.js";
import Document, { IDocument } from "../models/Document.js";
import { IDocumentsRepository } from "./interfaces/IDocumentsRepository.js";

export class DocumentsRepository extends BaseRepository<IDocument> implements IDocumentsRepository {
    constructor() {
        super(Document);
    }

    async findByUser(userId: string, page: number = 1, limit: number = 10, search?: string, labels?: string[], options?: QueryOptions & { session?: ClientSession }): Promise<{ documents: IDocument[]; total: number }> {
        const skip = (page - 1) * limit;
        const query: Record<string, unknown> = { user_id: new mongoose.Types.ObjectId(userId) };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (labels && labels.length > 0) {
            query.labels = { $in: labels };
        }

        // Sequential queries to avoid transaction number conflicts when using session
        const documents = await this.model.find(query, null, options).sort({ created_at: -1 }).skip(skip).limit(limit);
        const total = await this.model.countDocuments(query).session(options?.session || null);

        return { documents, total };
    }

    async findUniqueLabels(userId: string, options?: QueryOptions & { session?: ClientSession }): Promise<string[]> {
        const result = await this.model.distinct("labels", { user_id: new mongoose.Types.ObjectId(userId) }).session(options?.session || null);
        return result.filter((label): label is string => typeof label === 'string' && label.length > 0).sort();
    }
}

export const documentsRepository = new DocumentsRepository();
