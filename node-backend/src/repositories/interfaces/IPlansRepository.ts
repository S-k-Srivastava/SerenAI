import { IPlan } from "../../models/Plan.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IPlansRepository extends IBaseRepository<IPlan> {
    findAll(filter?: FilterQuery<IPlan>, limit?: number, skip?: number, options?: QueryOptions & { session?: ClientSession }): Promise<IPlan[]>;
    findActivePlans(options?: QueryOptions & { session?: ClientSession }): Promise<IPlan[]>;
}
