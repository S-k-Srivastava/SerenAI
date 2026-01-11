import { Request, Response } from "express";
import { userHelpService } from "../services/user.help.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/helpers/responseHelper.js";

/**
 * User-specific Help Controller
 * Handles actions where the user is the context owner.
 */

export const createHelp = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("User not authenticated");

  const help = await userHelpService.createHelp({
    user_id: userId,
    subject: req.body.subject,
    body: req.body.body,
  });

  sendCreated(res, { help }, "Help ticket created successfully");
});

export const getMyHelp = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("User not authenticated");

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const result = await userHelpService.getMyHelp(userId, page, limit, status, search);
  sendSuccess(res, result);
});

export const getHelpById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("User not authenticated");
  
  const id = req.params.id;
  if (!id) throw new Error("ID required");

  // Service enforces ownership
  const help = await userHelpService.getHelpById(id, userId);
  sendSuccess(res, { help });
});

export const replyToHelp = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("User not authenticated");

  const id = req.params.id;
  if (!id) throw new Error("ID required");

  // Service enforces ownership
  const updatedHelp = await userHelpService.replyToHelp(id, userId, req.body.content);

  sendSuccess(res, { help: updatedHelp }, "Reply sent successfully");
});
