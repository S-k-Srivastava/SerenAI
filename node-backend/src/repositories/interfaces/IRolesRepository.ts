import { IRole } from "../../models/Role.js";
import { IBaseRepository } from "./IBaseRepository.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";

export interface IRolesRepository extends IBaseRepository<IRole> {
    findByName(name: string, options?: QueryOptions & { session?: ClientSession }): Promise<IRole | null>;
    findAll(filter?: FilterQuery<IRole>, options?: QueryOptions & { session?: ClientSession }): Promise<IRole[]>;
    getRoles(page?: number, limit?: number, search?: string, options?: QueryOptions & { session?: ClientSession }): Promise<{ roles: IRole[]; total: number }>;
    getRolesByIds(roleIds: string[], options?: QueryOptions & { session?: ClientSession }): Promise<IRole[]>;
    findActive(options?: QueryOptions & { session?: ClientSession }): Promise<IRole[]>;
}
