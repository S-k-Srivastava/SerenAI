import { Request, Response } from "express";
import { adminContactUsService } from "../services/admin.contactus.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess } from "../utils/helpers/responseHelper.js";
import { UpdateContactUsStatusRequest } from "../schemas/contactus.js";
import { ContactUsStatusEnum } from "../types/index.js";

export const getContactUsSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as ContactUsStatusEnum | undefined;
  const search = (req.query.search as string) || "";

  const result = await adminContactUsService.getContactUsSubmissions(
    page,
    limit,
    status,
    search
  );
  sendSuccess(res, result, "Contact submissions retrieved successfully");
});

export const getContactUsById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const contactUs = await adminContactUsService.getContactUsById(id || "");
  sendSuccess(res, { contactUs }, "Contact submission retrieved successfully");
});

export const updateContactUsStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: UpdateContactUsStatusRequest = req.body;
  const contactUs = await adminContactUsService.updateContactUsStatus(id || "", data);
  sendSuccess(res, { contactUs }, "Contact submission status updated successfully");
});
