import { IHelp } from "../models/Help.js";
import { helpRepository } from "../repositories/help.repository.js";
import { IPaginatedResult, HelpStatusEnum, RoleEnum } from "../types/index.js";
import { AppError } from "../errors/AppError.js";
import { ICreateHelpRequest, IUserHelpService } from "./interfaces/IUserHelpService.js";
import mongoose from "mongoose";
import { extractId } from "../utils/helpers/mongoose.js";

export class UserHelpService implements IUserHelpService {
  async createHelp(data: ICreateHelpRequest): Promise<IHelp> {
    const helpData: Partial<IHelp> = {
      user_id: new mongoose.Types.ObjectId(data.user_id),
      subject: data.subject,
      body: data.body,
      status: HelpStatusEnum.SUBMITTED,
      messages: [], 
    };
    return await helpRepository.create(helpData);
  }

  async getMyHelp(userId: string, page: number, limit: number, status?: string, search?: string): Promise<IPaginatedResult<IHelp>> {
     const filter: Record<string, unknown> = { user_id: userId };
     if (status) {
       filter.status = status;
     }
     if (search) {
       filter.subject = { $regex: search, $options: 'i' };
     }
     return await helpRepository.findAll(page, limit, filter);
  }

  async getHelpById(id: string, userId: string): Promise<IHelp> {
    const help = await helpRepository.findById(id);
    if (!help) {
      throw new AppError("Help ticket not found", 404);
    }

    const ownerId = extractId(help.user_id);

    if (ownerId !== userId) {
      throw new AppError("You do not have permission to view this ticket", 403);
    }

    return help;
  }

  async replyToHelp(id: string, userId: string, content: string): Promise<IHelp> {
    const help = await helpRepository.findById(id);
    if (!help) {
      throw new AppError("Help ticket not found", 404);
    }

    const ownerId = extractId(help.user_id);

    if (ownerId !== userId) {
      throw new AppError("You do not have permission to reply to this ticket", 403);
    }

    const updatedHelp = await helpRepository.addMessage(id, RoleEnum.USER, content);
    if (!updatedHelp) {
        throw new AppError("Failed to add reply", 500);
    }
    
    return updatedHelp;
  }
}

export const userHelpService = new UserHelpService();
