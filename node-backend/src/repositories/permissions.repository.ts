import { BaseRepository } from "./BaseRepository.js";
import { Permission, IPermission } from "../models/Permission.js";
import { IPermissionsRepository } from "./interfaces/IPermissionsRepository.js";

export class PermissionsRepository extends BaseRepository<IPermission> implements IPermissionsRepository {
  constructor() {
    super(Permission);
  }

  async getPermissionsByIds(permissionIds: string[]): Promise<IPermission[]> {
    return await this.model.find({ _id: { $in: permissionIds } });
  }

  async getAllPermissions(): Promise<IPermission[]> {
    return await this.model.find({});
  }
}

export const permissionsRepository = new PermissionsRepository();