import type { CreatePlanRequest, UpdatePlanRequest } from "../../schemas/plan.js";
import type { IPlanResponse, IAdminPlansResponse } from "../../types/index.js";

export interface IAdminPlansService {
    createPlan(data: CreatePlanRequest): Promise<IPlanResponse>;
    getPlans(page: number, limit: number, search?: string): Promise<IAdminPlansResponse>;
    getPlanById(id: string): Promise<IPlanResponse>;
    updatePlan(id: string, data: UpdatePlanRequest): Promise<IPlanResponse>;
    deletePlan(id: string): Promise<void>;
}
