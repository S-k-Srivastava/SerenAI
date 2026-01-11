import { Request, Response } from "express";
import { publicPlansService } from "../services/public.plans.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess } from "../utils/helpers/responseHelper.js";

export const getPublicPlans = asyncHandler(async (_req: Request, res: Response) => {
    const plans = await publicPlansService.getPublicPlans();
    sendSuccess(res, { plans }, "Public plans retrieved successfully");
});
