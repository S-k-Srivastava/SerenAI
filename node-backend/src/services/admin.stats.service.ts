import { usersRepository } from "../repositories/users.repository.js";
import { chatbotsRepository } from "../repositories/chatbots.repository.js";
import { conversationsRepository } from "../repositories/conversations.repository.js";
import { rolesRepository } from "../repositories/roles.repository.js";
import { plansRepository } from "../repositories/plans.repository.js";
import { IAdminStatsService } from "./interfaces/IAdminStatsService.js";
import { IAdminStatsResponse, IUsageEventGroup } from "../types/index.js";
import logger from "../utils/logger/index.js";

import { usageEventsService } from "./usageEvents.service.js";

export class AdminStatsService implements IAdminStatsService {
  async getStats(startDate: Date, endDate: Date): Promise<IAdminStatsResponse> {
    try {
      const [users, chatbots, conversations, roles, plans, aiUsage] = await Promise.all([
        usersRepository.count({}),
        chatbotsRepository.count({}),
        conversationsRepository.count({}),
        rolesRepository.count({}),
        plansRepository.count({}),
        usageEventsService.getEventStats(startDate, endDate)
      ]);

      // Group AI Usage by event_type
      const groupedUsage: Record<string, IUsageEventGroup> = {};
      
      aiUsage.forEach((event) => {
        const type = event.event_type;
        if (!groupedUsage[type]) {
          groupedUsage[type] = {
            event_type: type,
            events: []
          };
        }
        
        groupedUsage[type].events.push({
          date: event.date,
          provider: event.provider,
          model_name: event.model_name,
          total_tokens: event.total_tokens
        });
      });

      return {
        users,
        chatbots,
        conversations,
        roles,
        plans,
        aiUsage: Object.values(groupedUsage)
      };
    } catch (error) {
      logger.error("Error fetching admin stats:", error);
      throw error;
    }
  }
}

export const adminStatsService = new AdminStatsService();
