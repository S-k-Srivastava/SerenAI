import { IHelp } from "../models/Help.js";
import { helpRepository } from "../repositories/help.repository.js";
import { IPaginatedResult, RoleEnum } from "../types/index.js";
import { AppError } from "../errors/AppError.js";
import { IAdminHelpService } from "./interfaces/IAdminHelpService.js";

export class AdminHelpService implements IAdminHelpService {
  async getAllHelp(
    page: number,
    limit: number,
    filter: Record<string, unknown> = {}
  ): Promise<IPaginatedResult<IHelp>> {
    return await helpRepository.findAll(page, limit, filter);
  }

  async getHelpById(id: string): Promise<IHelp> {
    const help = await helpRepository.findById(id);
    if (!help) {
      throw new AppError("Help ticket not found", 404);
    }
    return help;
  }

  async replyToHelp(id: string, content: string): Promise<IHelp> {
    const help = await helpRepository.findById(id);
    if (!help) {
      throw new AppError("Help ticket not found", 404);
    }
    
    // Admin can reply to any ticket
    const updatedHelp = await helpRepository.addMessage(id, RoleEnum.ADMIN, content);
    if (!updatedHelp) {
        throw new AppError("Failed to add reply", 500);
    }
    
    return updatedHelp;
  }
}

export const adminHelpService = new AdminHelpService();
