import { Request, Response } from "express";
import { adminStatsService } from "../services/admin.stats.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess } from "../utils/helpers/responseHelper.js";

export class AdminStatsController {
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    
    let start: Date;
    let end: Date;

    start = new Date(startDate as string);
    end = new Date(endDate as string);

    const stats = await adminStatsService.getStats(start, end);
    sendSuccess(res, stats, "Admin stats fetched successfully");
  });
}

export const adminStatsController = new AdminStatsController();
