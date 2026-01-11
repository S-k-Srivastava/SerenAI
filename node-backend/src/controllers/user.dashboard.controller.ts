import { Request, Response } from "express";
import { UserDashboardService } from "../services/user.dashboard.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess } from "../utils/helpers/responseHelper.js";

const dashboardService = new UserDashboardService();

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const stats = await dashboardService.getStats(userId);
    sendSuccess(res, stats, "Dashboard stats retrieved successfully");
});
