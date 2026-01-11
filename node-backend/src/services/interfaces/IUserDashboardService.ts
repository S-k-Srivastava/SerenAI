import { IUserDashboardStatsResponse } from "../../types/index.js";

export interface IUserDashboardService {
    getStats(userId: string): Promise<IUserDashboardStatsResponse>;
}
