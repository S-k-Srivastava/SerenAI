import { Document, FilterQuery, UpdateQuery, QueryOptions, SaveOptions, ClientSession } from "mongoose";

export interface IBaseRepository<T extends Document> {
    create(data: Partial<T>, options?: SaveOptions & { session?: ClientSession }): Promise<T>;
    findById(id: string, options?: QueryOptions & { session?: ClientSession }): Promise<T | null>;
    findOne(filter: FilterQuery<T>, options?: QueryOptions & { session?: ClientSession }): Promise<T | null>;
    find(filter: FilterQuery<T>, options?: QueryOptions & { session?: ClientSession }): Promise<T[]>;
    updateById(id: string, update: UpdateQuery<T>, options?: QueryOptions & { session?: ClientSession }): Promise<T | null>;
    deleteById(id: string, options?: QueryOptions & { session?: ClientSession }): Promise<boolean>;
    deleteOne(filter: FilterQuery<T>, options?: QueryOptions & { session?: ClientSession }): Promise<boolean>;
    exists(filter: FilterQuery<T>): Promise<boolean>;
    count(filter: FilterQuery<T>): Promise<number>;
}
