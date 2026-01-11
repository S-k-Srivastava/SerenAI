import { IPaginatedResult } from "./common";

export interface IPermission {
  _id: string;
  action: string;
  resource: string;
  scope: 'all' | 'self';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRole {
  _id: string;
  name: string;
  description?: string;
  permissions: string[] | IPermission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}

export type UpdateRoleData = Partial<CreateRoleData>;

export type RolesResponse = IPaginatedResult<IRole>;
