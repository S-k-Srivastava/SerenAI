import express from 'express';
import { adminStatsController } from '../controllers/admin.stats.controller.js';
import { authenticate } from '../middleware/auth/authenticate.js';
import { authorize } from '../middleware/auth/authorize.js';
import { ActionEnum, ResourceEnum, ScopeEnum } from '../types/index.js';

import { validateRequest } from '../middleware/validation/validateRequest.js';
import { GetAdminStatsSchema } from '../schemas/admin.stats.js';

const router = express.Router();

router.use(authenticate);

router.get(
    '/',
    validateRequest(GetAdminStatsSchema),
    authorize(ActionEnum.READ, ResourceEnum.ADMIN_STATS, ScopeEnum.ALL),
    adminStatsController.getStats
);

export default router;
