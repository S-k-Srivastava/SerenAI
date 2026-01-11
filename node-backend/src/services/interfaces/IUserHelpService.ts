import { IHelp } from "../../models/Help.js";
import { IPaginatedResult } from "../../types/index.js";

export interface ICreateHelpRequest {
  user_id: string;
  subject: string;
  body: string;
}

export interface IUserHelpService {
  createHelp(data: ICreateHelpRequest): Promise<IHelp>;
  getMyHelp(userId: string, page: number, limit: number, status?: string, search?: string): Promise<IPaginatedResult<IHelp>>;
  getHelpById(id: string, userId: string): Promise<IHelp>;
  replyToHelp(id: string, userId: string, content: string): Promise<IHelp>;
}
