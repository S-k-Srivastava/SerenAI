import { IHelp } from "../../models/Help.js";
import { IPaginatedResult } from "../../types/index.js";

export interface IAdminHelpService {
  getAllHelp(page: number, limit: number, filter?: Record<string, unknown>): Promise<IPaginatedResult<IHelp>>;
  getHelpById(id: string): Promise<IHelp>;
  replyToHelp(id: string, content: string): Promise<IHelp>;
}
