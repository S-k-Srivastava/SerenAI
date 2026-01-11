import { usersRepository } from "../repositories/users.repository.js";
import { rolesRepository } from "../repositories/roles.repository.js";
import { IUser } from "../models/User.js";
import { NotFoundError, BadRequestError } from "../errors/index.js";
import mongoose, { FilterQuery } from "mongoose";
import { CreateUserRequest, UpdateUserRequest, UpdateUserRoleRequest } from "../schemas/user.js";
import { IAdminUsersResponse, IUserResponse } from "../types/index.js";
import { IAdminUsersService } from "./interfaces/IAdminUsersService.js";

export class AdminUsersService implements IAdminUsersService {
    async getAllUsers(page: number = 1, limit: number = 10, search: string = ""): Promise<IAdminUsersResponse> {
        const skip = (page - 1) * limit;
        const filter: FilterQuery<IUser> = {};

        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: "i" } },
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
            ];
        }

        const [users, total] = await Promise.all([
            usersRepository.find(filter, {
                skip,
                limit,
                sort: { createdAt: -1 },
                populate: "roles"
            }),
            usersRepository.count(filter)
        ]);

        return {
            data: users.map(u => u.toObject() as unknown as IUserResponse),
        //    pagination: { ... } (keep existing pagination but I need to include it in replacement)
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getUserById(id: string): Promise<IUserResponse> {
        const user = await usersRepository.findById(id, { populate: 'roles' });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return user.toObject() as unknown as IUserResponse;
    }

    async updateUserRoles(userId: string, data: UpdateUserRoleRequest): Promise<IUserResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await usersRepository.findById(userId);
            if (!user) {
                throw new NotFoundError("User not found");
            }

            // Verify roles exist
            const roles = await rolesRepository.find({ _id: { $in: data.roleIds } }, { session });
            if (roles.length !== data.roleIds.length) {
                throw new BadRequestError("One or more roles invalid");
            }

            const updatedUser = await usersRepository.updateById(userId, {
                roles: data.roleIds
            }, { session });

            if (!updatedUser) throw new NotFoundError("User not found");

            await session.commitTransaction();
            return updatedUser.toObject() as unknown as IUserResponse;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async createUser(data: CreateUserRequest): Promise<IUserResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const existingUser = await usersRepository.findByEmail(data.email, { session });
            if (existingUser) {
                throw new BadRequestError("User with this email already exists");
            }

            const newUser = await usersRepository.create({
                ...data,
                roles: data.roles?.map(id => new mongoose.Types.ObjectId(id)) || [],
                isActive: data.isActive ?? true
            }, { session });

            await session.commitTransaction();
            return newUser.toObject() as unknown as IUserResponse;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async updateUser(userId: string, data: UpdateUserRequest): Promise<IUserResponse> {
        const user = await usersRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        const updatedUser = await usersRepository.updateById(userId, data);
        if (!updatedUser) throw new NotFoundError("User not found");
        return updatedUser.toObject() as unknown as IUserResponse;
    }

    async deleteUser(userId: string): Promise<void> {
        const user = await usersRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        await usersRepository.deleteById(userId);
    }
}

export const adminUsersService = new AdminUsersService();
