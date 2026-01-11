import { Request, Response } from "express";
import { adminHelpService } from "../services/admin.help.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess } from "../utils/helpers/responseHelper.js";

/**
 * Admin-specific Help Controller
 * Handles actions where the admin is the context owner or manager.
 */

export const getAllHelpAdmin = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const search = req.query.search as string;
  const targetUserId = req.query.user_id as string; 

  // Build filter for admin context
  const filter: Record<string, unknown> = {};
  
  if (targetUserId) {
      filter.user_id = targetUserId;
  }
  
  if (status) {
    filter.status = status;
  }

  if (search) {
      filter.subject = { $regex: search, $options: 'i' };
  }

  const result = await adminHelpService.getAllHelp(page, limit, filter);
  sendSuccess(res, result);
});

export const getHelpByIdAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new Error("ID required");

  // Admin access: no ownership check needed
  const help = await adminHelpService.getHelpById(id);
  sendSuccess(res, { help });
});

export const replyToHelpAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) throw new Error("ID required");

  const help = await adminHelpService.replyToHelp(id, req.body.content);
  
  sendSuccess(res, { help }, "Reply added successfully");
});
