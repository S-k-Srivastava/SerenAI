import { Request, Response } from "express";
import { adminRolesService } from "../services/admin.roles.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess } from "../utils/helpers/responseHelper.js";

export const getRoles = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await adminRolesService.getAllRoles(page, limit, search);
    sendSuccess(res, result, "Roles retrieved successfully");
});

export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const roleId = req.params.id || "";
    const role = await adminRolesService.getRoleById(roleId);
    sendSuccess(res, role, "Role retrieved successfully");
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
    const role = await adminRolesService.createRole(req.body);
    sendSuccess(res, role, "Role created successfully");
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
    const roleId = req.params.id || "";
    const role = await adminRolesService.updateRole(roleId, req.body);
    sendSuccess(res, role, "Role updated successfully");
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const roleId = req.params.id || "";
    await adminRolesService.deleteRole(roleId);
    sendSuccess(res, null, "Role deleted successfully");
});

export const getPermissions = asyncHandler(async (_req: Request, res: Response) => {
    const permissions = await adminRolesService.getResourcesAndActions();
    sendSuccess(res, permissions, "Permissions retrieved successfully");
});
