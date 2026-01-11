import { CreateUserRequest, UpdateUserRequest, UpdateUserRoleRequest } from "../../schemas/user.js";
import { IAdminUsersResponse, IUserResponse } from "../../types/index.js";

export interface IAdminUsersService {
    getAllUsers(page?: number, limit?: number, search?: string): Promise<IAdminUsersResponse>;
    getUserById(id: string): Promise<IUserResponse>;
    updateUserRoles(userId: string, data: UpdateUserRoleRequest): Promise<IUserResponse>;
    createUser(data: CreateUserRequest): Promise<IUserResponse>;
    updateUser(userId: string, data: UpdateUserRequest): Promise<IUserResponse>;
    deleteUser(userId: string): Promise<void>;
}
