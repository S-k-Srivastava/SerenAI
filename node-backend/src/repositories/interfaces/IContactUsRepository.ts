import { IBaseRepository } from "./IBaseRepository.js";
import { IContactUs } from "../../models/ContactUs.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";

export interface IContactUsRepository extends IBaseRepository<IContactUs> {
  findAllPaginated(
    filter: FilterQuery<IContactUs>,
    limit: number,
    skip: number,
    options?: QueryOptions & { session?: ClientSession }
  ): Promise<IContactUs[]>;
}
