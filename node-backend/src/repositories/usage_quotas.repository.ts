import { BaseRepository } from "./BaseRepository.js";
import UsageQuota, { IUsageQuota } from "../models/UsageQuota.js";

// For now, let's assume we will export a class and standard interface or just class.
// The user asked to remove "users. admin." etc prefix.
// I will stick to class export.

export class UsageQuotasRepository extends BaseRepository<IUsageQuota> {
    constructor() {
        super(UsageQuota);
    }

    async findBySubscriptionId(subscriptionId: string): Promise<IUsageQuota | null> {
        return this.model.findOne({ subscription_id: subscriptionId });
    }
}

export const usageQuotasRepository = new UsageQuotasRepository();
