import { IAdminStatsResponse } from "../../types/index.js";

export interface IAdminStatsService {
  getStats(startDate?: Date, endDate?: Date): Promise<IAdminStatsResponse>;
}
