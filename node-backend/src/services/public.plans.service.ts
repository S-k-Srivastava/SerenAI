import { IPublicPlansResponse } from "../types/index.js";
import { plansRepository } from "../repositories/plans.repository.js";
import { IPublicPlansService } from "./interfaces/IPublicPlansService.js";

export class PublicPlansService implements IPublicPlansService {
    async getPublicPlans(): Promise<IPublicPlansResponse> {
        return await plansRepository.findActivePlans();
    }
}

export const publicPlansService = new PublicPlansService();
