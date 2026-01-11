import { IContactUs } from "../models/ContactUs.js";
import { CreateContactUsRequest } from "../schemas/contactus.js";
import { contactUsRepository } from "../repositories/contactus.repository.js";
import { IContactUsResponse } from "../types/index.js";
import { IContactUsService } from "./interfaces/IContactUsService.js";

export class ContactUsService implements IContactUsService {
  async createContactUs(data: CreateContactUsRequest): Promise<IContactUsResponse> {
    const contactUs = await contactUsRepository.create(data as unknown as Partial<IContactUs>);
    return contactUs;
  }
}

export const contactUsService = new ContactUsService();
