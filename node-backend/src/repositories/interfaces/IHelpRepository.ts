import { IHelp } from "../../models/Help.js";
import { IPaginatedResult } from "../../types/index.js";
import { QueryOptions, ClientSession, SaveOptions, UpdateQuery } from "mongoose";

export interface IHelpRepository {
  create(data: Partial<IHelp>, options?: SaveOptions & { session?: ClientSession }): Promise<IHelp>;
  findById(id: string, options?: QueryOptions & { session?: ClientSession }): Promise<IHelp | null>;
  findAll(page: number, limit: number, filter?: object, options?: QueryOptions & { session?: ClientSession }): Promise<IPaginatedResult<IHelp>>;
  update(id: string, data: UpdateQuery<IHelp>, options?: QueryOptions & { session?: ClientSession }): Promise<IHelp | null>;
  addMessage(id: string, role: string, content: string, options?: QueryOptions & { session?: ClientSession }): Promise<IHelp | null>;
  count(filter?: object): Promise<number>;
}
