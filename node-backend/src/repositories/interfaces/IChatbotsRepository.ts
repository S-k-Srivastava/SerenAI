import { IChatBot } from "../../models/ChatBot.js";
import { IBaseRepository } from "./IBaseRepository.js";
import { FilterQuery, QueryOptions } from "mongoose";

export interface IChatbotsRepository extends IBaseRepository<IChatBot> {
    findPopulated(filter: FilterQuery<IChatBot>, skip?: number, limit?: number, sort?: Record<string, 1 | -1>, options?: QueryOptions): Promise<IChatBot[]>;
    findByIdPopulated(id: string, options?: QueryOptions): Promise<IChatBot | null>;
    count(filter: FilterQuery<IChatBot>): Promise<number>;
}
