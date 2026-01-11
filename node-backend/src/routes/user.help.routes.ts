import express from "express";
import { createHelp, getHelpById, getMyHelp, replyToHelp } from "../controllers/user.help.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

import { CreateHelpSchema, ReplyHelpSchema } from "../schemas/help.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(ActionEnum.CREATE, ResourceEnum.HELP, ScopeEnum.SELF),
  validateRequest(CreateHelpSchema),
  createHelp
);

router.get(
  "/",
  authenticate,
  authorize(ActionEnum.READ, ResourceEnum.HELP, ScopeEnum.SELF),
  getMyHelp
);

router.get(
  "/:id",
  authenticate,
  authorize(ActionEnum.READ, ResourceEnum.HELP, ScopeEnum.SELF),
  getHelpById
);

router.post(
  "/:id/reply",
  authenticate,
  authorize(ActionEnum.UPDATE, ResourceEnum.HELP, ScopeEnum.SELF),
  validateRequest(ReplyHelpSchema),
  replyToHelp
);

export default router;
