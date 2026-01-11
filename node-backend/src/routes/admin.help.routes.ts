import express from "express";
import {
  getAllHelpAdmin,
  getHelpByIdAdmin,
  replyToHelpAdmin,
} from "../controllers/admin.help.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import { ReplyHelpSchema } from "../schemas/help.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize(ActionEnum.READ, ResourceEnum.HELP, ScopeEnum.ALL),
  getAllHelpAdmin
);

router.get(
  "/:id",
  authenticate,
  authorize(ActionEnum.READ, ResourceEnum.HELP, ScopeEnum.ALL),
  getHelpByIdAdmin
);

router.post(
  "/:id/reply",
  authenticate,
  authorize(ActionEnum.UPDATE, ResourceEnum.HELP, ScopeEnum.ALL),
  validateRequest(ReplyHelpSchema),
  replyToHelpAdmin
);

export default router;
