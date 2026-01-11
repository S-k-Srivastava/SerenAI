import express from "express";
import {
    getUsers,
    getUserById,
    updateUserRoles,
    createUser,
} from "../controllers/admin.users.controller.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { authorize } from "../middleware/auth/authorize.js";
import { validateRequest } from "../middleware/validation/validateRequest.js";
import { CreateUserSchema, UpdateUserRoleSchema } from "../schemas/user.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../types/index.js";

const router = express.Router();

router
  .get(
    "/",
    authenticate,
    authorize(ActionEnum.READ, ResourceEnum.USER, ScopeEnum.ALL),
    getUsers
  )
  .post(
    "/",
    authenticate,
    authorize(ActionEnum.CREATE, ResourceEnum.USER, ScopeEnum.ALL),
    validateRequest(CreateUserSchema),
    createUser
  );

router
  .get(
    "/:id",
    authenticate,
    authorize(ActionEnum.READ, ResourceEnum.USER, ScopeEnum.ALL),
    getUserById
  );

router
  .put(
    "/:id/roles",
    authenticate,
    authorize(ActionEnum.UPDATE, ResourceEnum.USER, ScopeEnum.ALL),
    validateRequest(UpdateUserRoleSchema),
    updateUserRoles
  );

export default router;
