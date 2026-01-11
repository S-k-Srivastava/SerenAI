import { IPermission } from "../../models/Permission.js";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IPermissionsRepository extends IBaseRepository<IPermission> {
    getPermissionsByIds(permissionIds: string[]): Promise<IPermission[]>;
    getAllPermissions(): Promise<IPermission[]>;
}