import { Request, Response } from "express";
import { AdminPlansService } from "../services/admin.plans.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/helpers/responseHelper.js";
import { CreatePlanRequest, UpdatePlanRequest } from "../schemas/plan.js";

const planService = new AdminPlansService();

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
    const data: CreatePlanRequest = req.body;
    const plan = await planService.createPlan(data);
    sendCreated(res, { plan }, `Plan "${plan.name}" created successfully`);
});

export const getPlans = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await planService.getPlans(page, limit, search);
    sendSuccess(res, result, "Plans retrieved successfully");
});

export const getPlanById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const plan = await planService.getPlanById(id || "");
    sendSuccess(res, { plan }, "Plan retrieved successfully");
});

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdatePlanRequest = req.body;
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined)) as UpdatePlanRequest;
    const plan = await planService.updatePlan(id || "", cleanData);
    sendSuccess(res, { plan }, `Plan "${plan.name}" updated successfully`);
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await planService.deletePlan(id || "");
    sendSuccess(res, null, "Plan deleted successfully");
});
