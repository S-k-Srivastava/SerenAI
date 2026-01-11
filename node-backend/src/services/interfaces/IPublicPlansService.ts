import { IPublicPlansResponse } from "../../types/index.js";

export interface IPublicPlansService {
    getPublicPlans(): Promise<IPublicPlansResponse>;
}
