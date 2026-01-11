import Help, { IHelp } from "../models/Help.js";
import { IHelpRepository } from "./interfaces/IHelpRepository.js";
import { IPaginatedResult } from "../types/index.js";
import { QueryOptions, ClientSession, SaveOptions, UpdateQuery } from "mongoose";

export class HelpRepository implements IHelpRepository {
  async create(data: Partial<IHelp>, options?: SaveOptions & { session?: ClientSession }): Promise<IHelp> {
    const result = await Help.create([data], options);
    if (!result || result.length === 0) {
        throw new Error("Failed to create Help document");
    }
    return result[0]!;
  }

  async findById(id: string, options?: QueryOptions & { session?: ClientSession }): Promise<IHelp | null> {
    return await Help.findById(id, null, options).populate("user_id", "email _id"); // Populate user info lightly
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filter: object = {},
    options?: QueryOptions & { session?: ClientSession }
  ): Promise<IPaginatedResult<IHelp>> {
    const skip = (page - 1) * limit;

    // Sequential queries to avoid transaction number conflicts when using session
    const data = await Help.find(filter, null, options)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user_id", "email _id"); // Populate user info
    const total = await Help.countDocuments(filter).session(options?.session || null);

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

  async update(id: string, data: UpdateQuery<IHelp>, options?: QueryOptions & { session?: ClientSession }): Promise<IHelp | null> {
    const opts = { new: true, ...options };
    return await Help.findByIdAndUpdate(id, data, opts);
  }

  async addMessage(id: string, role: string, content: string, options?: QueryOptions & { session?: ClientSession }): Promise<IHelp | null> {
    const opts = { new: true, ...options };
    return await Help.findByIdAndUpdate(
      id,
      {
        $push: {
          messages: {
            role,
            content,
            createdAt: new Date(),
          },
        },
      },
      opts
    );
  }

  async count(filter: object = {}): Promise<number> {
    return await Help.countDocuments(filter);
  }
}

export const helpRepository = new HelpRepository();
