import express from "express";
import {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
} from "../controllers/admin.roles.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import { CreateRoleSchema, UpdateRoleSchema } from "../schemas/role.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

const router = express.Router();

router.use(authenticate); // All role management requires authentication

// Permission Routes (for listing available permissions)
router.get(
    "/permissions",
    authorize(ActionEnum.READ, ResourceEnum.ROLE, ScopeEnum.ALL),
    getPermissions
);

// Role CRUD Routes
router.route("/")
    .get(authorize(ActionEnum.READ, ResourceEnum.ROLE, ScopeEnum.ALL), getRoles)
    .post(authorize(ActionEnum.CREATE, ResourceEnum.ROLE, ScopeEnum.ALL), validateRequest(CreateRoleSchema), createRole);

router.route("/:id")
    .get(authorize(ActionEnum.READ, ResourceEnum.ROLE, ScopeEnum.ALL), getRoleById)
    .put(authorize(ActionEnum.UPDATE, ResourceEnum.ROLE, ScopeEnum.ALL), validateRequest(UpdateRoleSchema), updateRole)
    .delete(authorize(ActionEnum.DELETE, ResourceEnum.ROLE, ScopeEnum.ALL), deleteRole);

export default router;
