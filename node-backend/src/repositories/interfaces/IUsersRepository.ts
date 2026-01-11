import { IUser } from "../../models/User.js";
import { IBaseRepository } from "./IBaseRepository.js";
import { QueryOptions, ClientSession } from "mongoose";

export interface IUsersRepository extends IBaseRepository<IUser> {
  findByEmail(email: string, options?: QueryOptions & { session?: ClientSession }): Promise<IUser | null>;
  findByEmailWithPassword(email: string, options?: QueryOptions & { session?: ClientSession }): Promise<IUser | null>;
}