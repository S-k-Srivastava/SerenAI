import { IContactUs } from "../models/ContactUs.js";
import { FilterQuery } from "mongoose";
import { NotFoundError } from "../errors/index.js";
import { UpdateContactUsStatusRequest } from "../schemas/contactus.js";
import { contactUsRepository } from "../repositories/contactus.repository.js";
import { IContactUsResponse, IAdminContactUsResponse, ContactUsStatusEnum } from "../types/index.js";
import { IAdminContactUsService } from "./interfaces/IAdminContactUsService.js";

export class AdminContactUsService implements IAdminContactUsService {
  async getContactUsSubmissions(
    page: number = 1,
    limit: number = 10,
    status?: ContactUsStatusEnum,
    search?: string
  ): Promise<IAdminContactUsResponse> {
    const skip = (page - 1) * limit;
    const filter: FilterQuery<IContactUs> = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      contactUsRepository.findAllPaginated(filter, limit, skip),
      contactUsRepository.count(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getContactUsById(id: string): Promise<IContactUsResponse> {
    const contactUs = await contactUsRepository.findById(id);
    if (!contactUs) {
      throw new NotFoundError("Contact submission not found");
    }
    return contactUs;
  }

  async updateContactUsStatus(
    id: string,
    data: UpdateContactUsStatusRequest
  ): Promise<IContactUsResponse> {
    const contactUs = await contactUsRepository.findById(id);
    if (!contactUs) {
      throw new NotFoundError("Contact submission not found");
    }

    const updated = await contactUsRepository.updateById(id, data);
    if (!updated) {
      throw new NotFoundError("Failed to update contact submission");
    }

    return updated;
  }
}

export const adminContactUsService = new AdminContactUsService();
