import { Request, Response } from "express";
import { contactUsService } from "../services/contactus.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendCreated } from "../utils/helpers/responseHelper.js";
import { CreateContactUsRequest } from "../schemas/contactus.js";

export const createContactUs = asyncHandler(async (req: Request, res: Response) => {
  const data: CreateContactUsRequest = req.body;
  const contactUs = await contactUsService.createContactUs(data);
  sendCreated(res, { contactUs }, "Thank you for contacting us! We'll get back to you soon.");
});
