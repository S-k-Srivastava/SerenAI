import { IDocument } from "../../models/Document.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IDocumentsRepository extends IBaseRepository<IDocument> {
    findByUser(userId: string, page: number, limit: number, search?: string, labels?: string[], options?: QueryOptions & { session?: ClientSession }): Promise<{ documents: IDocument[]; total: number }>;
    findUniqueLabels(userId: string, options?: QueryOptions & { session?: ClientSession }): Promise<string[]>;
    count(filter: FilterQuery<IDocument>): Promise<number>;
}
