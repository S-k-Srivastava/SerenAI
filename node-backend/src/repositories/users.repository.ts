import { BaseRepository } from "./BaseRepository.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";
import { User, IUser } from "../models/User.js";
import { IUsersRepository } from "./interfaces/IUsersRepository.js";

export class UsersRepository extends BaseRepository<IUser> implements IUsersRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string, options?: QueryOptions & { session?: ClientSession }): Promise<IUser | null> {
    return await this.findOne({ email }, options);
  }

  async findByEmailWithPassword(email: string, options?: QueryOptions & { session?: ClientSession }): Promise<IUser | null> {
    return await this.model.findOne({ email }, null, options).select("+password").exec();
  }

  async findAll(filters?: FilterQuery<IUser>, options?: QueryOptions): Promise<IUser[]> {
    return await this.model.find(filters || {}, null, options).exec();
  }
}

export const usersRepository = new UsersRepository();