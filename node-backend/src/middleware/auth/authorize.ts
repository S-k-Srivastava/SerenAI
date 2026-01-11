import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../../errors/index.js";
import { User } from "../../models/User.js";
import { ActionEnum, ResourceEnum, ScopeEnum } from "../../types/index.js";

// Use ScopeEnum for strict typing
export const authorize = (action: ActionEnum, resource: ResourceEnum, scope: ScopeEnum) => {
  return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        throw new ForbiddenError("Please log in to access this feature.");
      }

      // Check for super admin bypass if needed? For now strict role check first.
      
      const fullUser = await User.findById(user.id)
        .populate({
          path: "roles",
          populate: {
            path: "permissions",
            model: "Permission"
          }
        });

      if (!fullUser) {
        throw new ForbiddenError("Your user record could not be found. Please contact support.");
      }

      // We can skip RoleEnum check if we want pure permission based, 
      // but the original code had a requiredRole param. 
      // Wait, the original signature was `authorize(action, resource, requiredRole)`.
      // The user prompt said "no middleware no model no function should take it nullable".
      // But `requiredRole` was there. 
      // I should PROBABLY replace `requiredRole` with `scope` or add `scope`.
      // The prompt said: "2 values in new ScopeEnum 'all', 'self'".
      // And "authorize middleware and corresponding routes".
      
      // Let's remove `requiredRole` param and rely on permissions? 
      // Or keep it? The original code had: `authorize(ActionEnum.CREATE, ResourceEnum.HELP, RoleEnum.USER)`
      // The `RoleEnum.USER` was being checked against user roles.
      // If I replace `RoleEnum.USER` with `scope`, I make it pure RBAC.
      
      // However, usually `authorize` checks if YOU have permission.
      // Let's change the signature to `authorize(action, resource, scope)`.
      
      // Check permissions
      const userPermissions: string[] = [];

      if (fullUser.roles && Array.isArray(fullUser.roles)) {
        for (const role of fullUser.roles) {
          if (typeof role === 'object' && 'permissions' in role) {
            if (role.permissions && Array.isArray(role.permissions)) {
              for (const permission of role.permissions) {
                if (typeof permission === 'object' && 'action' in permission && 'resource' in permission && 'scope' in permission) {
                  userPermissions.push(`${permission.action}:${permission.resource}:${permission.scope}`);
                }
              }
            }
          }
        }
      }

      const requiredPermission = `${action}:${resource}:${scope}`;
      
      // Logic: If user has 'all' scope for this action/resource, they should technically verify for 'self' too?
      // User said: "make sure to find such overlapping cases and handle them with scope".
      // "Admin permissions and users permission currently overlapping... help.read is for both"
      // "Admin can read all, users can't."
      
      // If I require 'self', and I have 'all', do I pass? 
      // Strict matching is safer for now unless I implement hierarchy.
      // But if I am Admin and I want to "create chatbot" (self), I have create:chatbot:self in seed.
      // So checks should be exact match.
      
      if (!userPermissions.includes(requiredPermission)) {
        // Fallback check: IF scope is 'self' AND user has 'all', maybe allow?
        // Let's stick to exact match based on the Seeder I just wrote. 
        // I gave Admin explicit 'self' permissions for personal resources.
        // So exact match is correct.
        
        throw new ForbiddenError(`You don't have permission to ${action} this ${resource} with scope ${scope}.`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};