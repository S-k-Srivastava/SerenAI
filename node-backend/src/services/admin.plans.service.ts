import { IPlan } from "../models/Plan.js";
import mongoose, { FilterQuery } from "mongoose";
import { NotFoundError, BadRequestError } from "../errors/index.js";
import { CreatePlanRequest, UpdatePlanRequest } from "../schemas/plan.js";
import { plansRepository } from "../repositories/plans.repository.js";
import { IPlanResponse, IAdminPlansResponse } from "../types/index.js";
import { IAdminPlansService } from "./interfaces/IAdminPlansService.js";

export class AdminPlansService implements IAdminPlansService {
    async createPlan(data: CreatePlanRequest): Promise<IPlanResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check for duplicate name within transaction
            const existing = await plansRepository.findOne({ name: data.name });
            if (existing) {
                throw new BadRequestError("A plan with this name already exists");
            }

            const plan = await plansRepository.create(data as unknown as Partial<IPlan>, { session });

            await session.commitTransaction();
            return plan;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async getPlans(page: number = 1, limit: number = 10, search?: string): Promise<IAdminPlansResponse> {
        const skip = (page - 1) * limit;
        const filter: FilterQuery<IPlan> = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [data, total] = await Promise.all([
            plansRepository.find(filter, { skip, limit, sort: { price: 1 } }),
            plansRepository.count(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getPlanById(id: string): Promise<IPlanResponse> {
        const plan = await plansRepository.findById(id);
        if (!plan) {
            throw new NotFoundError("Plan not found");
        }
        return plan;
    }

    async updatePlan(id: string, data: UpdatePlanRequest): Promise<IPlanResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const plan = await plansRepository.findById(id);
            if (!plan) {
                throw new NotFoundError("Plan not found");
            }

            // Check name uniqueness if name is being updated
            if (data.name && data.name !== plan.name) {
                const existing = await plansRepository.findOne({ name: data.name });
                if (existing) {
                    throw new BadRequestError("A plan with this name already exists");
                }
            }

            const updated = await plansRepository.updateById(id, data, { session });
            if (!updated) {
                throw new NotFoundError("Failed to update plan");
            }

            await session.commitTransaction();
            return updated;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async deletePlan(id: string): Promise<void> {
        const deleted = await plansRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundError("Plan not found");
        }
    }
}
