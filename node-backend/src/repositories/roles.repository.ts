import { BaseRepository } from "./BaseRepository.js";
import { Role, IRole } from "../models/Role.js";
import { IRolesRepository } from "./interfaces/IRolesRepository.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";

export class RolesRepository extends BaseRepository<IRole> implements IRolesRepository {
    constructor() {
        super(Role);
    }

    async findByName(name: string, options?: QueryOptions & { session?: ClientSession }): Promise<IRole | null> {
        return await this.findOne({ name }, options);
    }

    async findAll(filter: FilterQuery<IRole> = {}, options?: QueryOptions & { session?: ClientSession }): Promise<IRole[]> {
        return await this.model.find(filter, null, options).populate("permissions").sort({ createdAt: -1 }).exec();
    }

    async getRoles(page: number = 1, limit: number = 10, search?: string, options?: QueryOptions & { session?: ClientSession }): Promise<{ roles: IRole[]; total: number }> {
        const skip = (page - 1) * limit;
        const query: FilterQuery<IRole> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Sequential queries to avoid transaction number conflicts when using session
        const roles = await this.model.find(query, null, options)
            .populate('permissions')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await this.model.countDocuments(query).session(options?.session || null);

        return { roles, total };
    }

    async getRolesByIds(roleIds: string[], options?: QueryOptions & { session?: ClientSession }): Promise<IRole[]> {
        return await this.model.find({ _id: { $in: roleIds } }, null, options).populate('permissions');
    }

    async findActive(options?: QueryOptions & { session?: ClientSession }): Promise<IRole[]> {
        return await this.model.find({ isActive: true }, null, options).populate('permissions');
    }
}

export const rolesRepository = new RolesRepository();
