import { CreateRoleRequest, UpdateRoleRequest } from "../../schemas/role.js";
import { IPermissionsResponse, IRoleResponse, IAdminRolesResponse } from "../../types/index.js";

export interface IAdminRolesService {
    getAllRoles(page?: number, limit?: number, search?: string): Promise<IAdminRolesResponse>;
    getRoleById(id: string): Promise<IRoleResponse>;
    createRole(data: CreateRoleRequest): Promise<IRoleResponse>;
    updateRole(id: string, data: UpdateRoleRequest): Promise<IRoleResponse>;
    deleteRole(id: string): Promise<void>;
    getResourcesAndActions(): Promise<IPermissionsResponse>;
}
