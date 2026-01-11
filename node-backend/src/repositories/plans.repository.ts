import { BaseRepository } from "./BaseRepository.js";
import Plan, { IPlan } from "../models/Plan.js";
import { IPlansRepository } from "./interfaces/IPlansRepository.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";

export class PlansRepository extends BaseRepository<IPlan> implements IPlansRepository {
    constructor() {
        super(Plan);
    }

    async findAll(filter: FilterQuery<IPlan> = {}, limit: number = 10, skip: number = 0, options?: QueryOptions & { session?: ClientSession }): Promise<IPlan[]> {
        return await this.model.find(filter, null, options).limit(limit).skip(skip).sort({ price: 1 }).exec();
    }

    async findActivePlans(options?: QueryOptions & { session?: ClientSession }): Promise<IPlan[]> {
        return this.model.find({ isActive: true }, null, options).sort({ price: 1 });
    }
}

export const plansRepository = new PlansRepository();
