import { Model, Document, FilterQuery, UpdateQuery, QueryOptions, SaveOptions, ClientSession } from "mongoose";
import { IBaseRepository } from "./interfaces/IBaseRepository.js";

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    constructor(protected readonly model: Model<T>) { }

    async create(data: Partial<T>, options?: SaveOptions & { session?: ClientSession }): Promise<T> {
        // Use array syntax to strictly enforce options (like session) usage in Mongoose
        const result = await this.model.create([data], options);
        // Result is always an array when using the array syntax
        if (!result || result.length === 0) {
             throw new Error("Failed to create document");
        }
        return result[0] as T;
    }

    async findById(id: string, options?: QueryOptions & { session?: ClientSession }): Promise<T | null> {
        return await this.model.findById(id, null, options).exec();
    }

    async findOne(filter: FilterQuery<T>, options?: QueryOptions & { session?: ClientSession }): Promise<T | null> {
        return await this.model.findOne(filter, null, options).exec();
    }

    async find(filter: FilterQuery<T>, options?: QueryOptions & { session?: ClientSession }): Promise<T[]> {
        return await this.model.find(filter, null, options).exec();
    }

    async updateById(id: string, update: UpdateQuery<T>, options?: QueryOptions & { session?: ClientSession }): Promise<T | null> {
        const opts = { new: true, ...options };
        return await this.model.findByIdAndUpdate(id, update, opts).exec();
    }

    async deleteById(id: string, options?: QueryOptions & { session?: ClientSession }): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id, options).exec();
        return !!result;
    }

    async deleteOne(filter: FilterQuery<T>, options?: QueryOptions & { session?: ClientSession }): Promise<boolean> {
        const result = await this.model.findOneAndDelete(filter, options).exec();
        return !!result;
    }

    async exists(filter: FilterQuery<T>): Promise<boolean> {
        const result = await this.model.exists(filter);
        return !!result;
    }

    async count(filter: FilterQuery<T>): Promise<number> {
        return await this.model.countDocuments(filter).exec();
    }
}
