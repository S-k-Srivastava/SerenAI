import { rolesRepository } from "../repositories/roles.repository.js";
import { permissionsRepository } from "../repositories/permissions.repository.js";
import mongoose from "mongoose";

import { ResourceEnum, ActionEnum, IPermissionsResponse, IRoleResponse, IAdminRolesResponse, IResourcesAndActionsResponse } from "../types/index.js";
import { NotFoundError, BadRequestError } from "../errors/index.js";
import { CreateRoleRequest, UpdateRoleRequest } from "../schemas/role.js";

import { IAdminRolesService } from "./interfaces/IAdminRolesService.js";

export class AdminRolesService implements IAdminRolesService {
    async getAllRoles(page: number = 1, limit: number = 10, search?: string): Promise<IAdminRolesResponse> {
        const { roles, total } = await rolesRepository.getRoles(page, limit, search);

        return {
            data: roles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getRoleById(id: string): Promise<IRoleResponse> {
        const role = await rolesRepository.findById(id);
        if (!role) {
            throw new NotFoundError("Role not found");
        }
        await role.populate('permissions');
        return role;
    }

    async createRole(data: CreateRoleRequest): Promise<IRoleResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const existingRole = await rolesRepository.findByName(data.name);
            if (existingRole) {
                throw new BadRequestError(`Role with name ${data.name} already exists`);
            }

            const role = await rolesRepository.create({
                name: data.name,
                description: data.description || "",
                permissions: data.permissionIds.map(id => new mongoose.Types.ObjectId(id))
            }, { session });

            await session.commitTransaction();
            return role;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async updateRole(id: string, data: UpdateRoleRequest): Promise<IRoleResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const role = await rolesRepository.findById(id);
            if (!role) {
                throw new NotFoundError("Role not found");
            }

            if (data.name && data.name !== role.name) {
                const existingRole = await rolesRepository.findByName(data.name);
                if (existingRole) {
                    throw new BadRequestError(`Role with name ${data.name} already exists`);
                }
            }

            const updatedRole = await rolesRepository.updateById(id, {
                ...data,
                permissions: data.permissionIds ? data.permissionIds.map(pid => new mongoose.Types.ObjectId(pid)) : undefined
            }, { session });

            if (!updatedRole) throw new NotFoundError("Role not found after update");

            await session.commitTransaction();
            return updatedRole;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async deleteRole(id: string): Promise<void> {
        const role = await rolesRepository.findById(id);
        if (!role) {
            throw new NotFoundError("Role not found");
        }

        if (role.name === 'admin' || role.name === 'user') {
            throw new BadRequestError("Cannot delete system roles");
        }

        await rolesRepository.deleteById(id);
    }

    async getResourcesAndActions(): Promise<IPermissionsResponse> {
        return await permissionsRepository.getAllPermissions();
    }

    getStaticResourcesAndActions(): IResourcesAndActionsResponse {
        return {
            resources: Object.values(ResourceEnum),
            actions: Object.values(ActionEnum)
        };
    }
}

export const adminRolesService = new AdminRolesService();
