import { Request, Response } from "express";
import { adminUsersService } from "../services/admin.users.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess } from "../utils/helpers/responseHelper.js";


export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await adminUsersService.getAllUsers(page, limit, search);
    sendSuccess(res, result, "Users retrieved successfully");
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id || "";
    const user = await adminUsersService.getUserById(userId);
    sendSuccess(res, user, "User retrieved successfully");
});

export const updateUserRoles = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id || "";
    const user = await adminUsersService.updateUserRoles(userId, req.body);
    sendSuccess(res, user, "User roles updated successfully");
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminUsersService.createUser(req.body);
    sendSuccess(res, user, "User created successfully", 201);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id || "";
    await adminUsersService.deleteUser(userId);
    sendSuccess(res, null, "User deleted successfully");
});
