import { IContactUsResponse } from "../../types/index.js";
import { CreateContactUsRequest } from "../../schemas/contactus.js";

export interface IContactUsService {
  createContactUs(data: CreateContactUsRequest): Promise<IContactUsResponse>;
}
