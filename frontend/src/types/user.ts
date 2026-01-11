import { IPaginatedResult } from "./common";
import { IRole } from "./role";

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: IRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles?: string[];
  isActive?: boolean;
}

export type UpdateUserData = Partial<CreateUserData>;

export type UsersResponse = IPaginatedResult<IUser>;
