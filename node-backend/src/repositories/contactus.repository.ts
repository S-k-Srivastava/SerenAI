import { BaseRepository } from "./BaseRepository.js";
import ContactUs, { IContactUs } from "../models/ContactUs.js";
import { IContactUsRepository } from "./interfaces/IContactUsRepository.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";

export class ContactUsRepository
  extends BaseRepository<IContactUs>
  implements IContactUsRepository
{
  constructor() {
    super(ContactUs);
  }

  async findAllPaginated(
    filter: FilterQuery<IContactUs> = {},
    limit: number = 10,
    skip: number = 0,
    options?: QueryOptions & { session?: ClientSession }
  ): Promise<IContactUs[]> {
    return await this.model
      .find(filter, null, options)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .exec();
  }
}

export const contactUsRepository = new ContactUsRepository();
