import { IContactUsResponse, IAdminContactUsResponse } from "../../types/index.js";
import { UpdateContactUsStatusRequest } from "../../schemas/contactus.js";
import { ContactUsStatusEnum } from "../../types/index.js";

export interface IAdminContactUsService {
  getContactUsSubmissions(
    page: number,
    limit: number,
    status?: ContactUsStatusEnum,
    search?: string
  ): Promise<IAdminContactUsResponse>;
  getContactUsById(id: string): Promise<IContactUsResponse>;
  updateContactUsStatus(
    id: string,
    data: UpdateContactUsStatusRequest
  ): Promise<IContactUsResponse>;
}
