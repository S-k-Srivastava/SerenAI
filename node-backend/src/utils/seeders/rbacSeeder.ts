import { Permission } from "../../models/Permission.js";
import { Role as RoleModel } from "../../models/Role.js";
import { User } from "../../models/User.js";
import { ActionEnum, ResourceEnum, RoleEnum, ScopeEnum } from "../../types/index.js";
import logger from "../logger/index.js";
import mongoose from "mongoose";

export interface PermissionData {
  action: string;
  resource: string;
  scope: ScopeEnum;
  description?: string;
}

export interface RoleData {
  name: string;
  description?: string;
  permissions: string[]; // Format: action:resource:scope
}

const permissions: PermissionData[] = [
  // --- USER Resource ---
  { action: ActionEnum.CREATE, resource: ResourceEnum.USER, scope: ScopeEnum.ALL, description: 'Create new users' },
  { action: ActionEnum.READ, resource: ResourceEnum.USER, scope: ScopeEnum.ALL, description: 'View all users' }, // Admin view
  { action: ActionEnum.READ, resource: ResourceEnum.USER, scope: ScopeEnum.SELF, description: 'View own user profile' }, // User "me" view - technically covered by PROFILE? Overlapping. Keeping distinct for now.
  { action: ActionEnum.UPDATE, resource: ResourceEnum.USER, scope: ScopeEnum.ALL, description: 'Update any user' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.USER, scope: ScopeEnum.SELF, description: 'Update own user' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.USER, scope: ScopeEnum.ALL, description: 'Delete any user' },

  // --- PROFILE Resource (Self only usually) ---
  { action: ActionEnum.READ, resource: ResourceEnum.PROFILE, scope: ScopeEnum.SELF, description: 'View own profile' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.PROFILE, scope: ScopeEnum.SELF, description: 'Update own profile' },

  // --- DASHBOARD Resource ---
  { action: ActionEnum.READ, resource: ResourceEnum.DASHBOARD, scope: ScopeEnum.ALL, description: 'View admin dashboard stats' },
  { action: ActionEnum.READ, resource: ResourceEnum.DASHBOARD, scope: ScopeEnum.SELF, description: 'View user dashboard stats' },

  // --- CHATBOT Resource ---
  { action: ActionEnum.CREATE, resource: ResourceEnum.CHATBOT, scope: ScopeEnum.SELF, description: 'Create chatbots' }, // Users create for themselves
  { action: ActionEnum.READ, resource: ResourceEnum.CHATBOT, scope: ScopeEnum.SELF, description: 'View own chatbots' },
  { action: ActionEnum.READ, resource: ResourceEnum.CHATBOT, scope: ScopeEnum.ALL, description: 'View all chatbots' }, // Admin
  { action: ActionEnum.UPDATE, resource: ResourceEnum.CHATBOT, scope: ScopeEnum.SELF, description: 'Update own chatbots' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.CHATBOT, scope: ScopeEnum.ALL, description: 'Update any chatbot' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.CHATBOT, scope: ScopeEnum.SELF, description: 'Delete own chatbots' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.CHATBOT, scope: ScopeEnum.ALL, description: 'Delete any chatbot' },

  // --- DOCUMENT Resource ---
  { action: ActionEnum.CREATE, resource: ResourceEnum.DOCUMENT, scope: ScopeEnum.SELF, description: 'Create documents' },
  { action: ActionEnum.READ, resource: ResourceEnum.DOCUMENT, scope: ScopeEnum.SELF, description: 'View own documents' },
  { action: ActionEnum.READ, resource: ResourceEnum.DOCUMENT, scope: ScopeEnum.ALL, description: 'View all documents' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.DOCUMENT, scope: ScopeEnum.SELF, description: 'Update own documents' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.DOCUMENT, scope: ScopeEnum.ALL, description: 'Update any document' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.DOCUMENT, scope: ScopeEnum.SELF, description: 'Delete own documents' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.DOCUMENT, scope: ScopeEnum.ALL, description: 'Delete any document' },

  // --- CHAT Resource ---
  { action: ActionEnum.CREATE, resource: ResourceEnum.CHAT, scope: ScopeEnum.SELF, description: 'Start new chat' },
  { action: ActionEnum.READ, resource: ResourceEnum.CHAT, scope: ScopeEnum.SELF, description: 'Read own chats' },
  { action: ActionEnum.READ, resource: ResourceEnum.CHAT, scope: ScopeEnum.ALL, description: 'Read all chats' }, // Admin inspection?
  { action: ActionEnum.UPDATE, resource: ResourceEnum.CHAT, scope: ScopeEnum.SELF, description: 'Send message' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.CHAT, scope: ScopeEnum.SELF, description: 'Delete own chat' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.CHAT, scope: ScopeEnum.ALL, description: 'Delete any chat' },

  // --- ROLE Resource (Admin only, always ALL) ---
  { action: ActionEnum.CREATE, resource: ResourceEnum.ROLE, scope: ScopeEnum.ALL, description: 'Create roles' },
  { action: ActionEnum.READ, resource: ResourceEnum.ROLE, scope: ScopeEnum.ALL, description: 'View roles' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.ROLE, scope: ScopeEnum.ALL, description: 'Update roles' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.ROLE, scope: ScopeEnum.ALL, description: 'Delete roles' },

  // --- PLAN Resource (Admin only, always ALL) ---
  { action: ActionEnum.CREATE, resource: ResourceEnum.PLAN, scope: ScopeEnum.ALL, description: 'Create plans' },
  { action: ActionEnum.READ, resource: ResourceEnum.PLAN, scope: ScopeEnum.ALL, description: 'View all plans' }, // Admin view
  // Users need to read plans too? Usually distinct public endpoint or covered here.
  // Assuming "self" read for plans means "view plans available to me"? Or just "all" is public?
  // Let's stick to 'all' for admin management. Public read might not need auth or need 'all' if plans are public.
  // But strictly, let's add 'self' if users need to view plans in a specific "my plan" context, or just 'all' is fine if it's public reference data.
  // Sticking to 'all' for management.

  { action: ActionEnum.UPDATE, resource: ResourceEnum.PLAN, scope: ScopeEnum.ALL, description: 'Update plans' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.PLAN, scope: ScopeEnum.ALL, description: 'Delete plans' },

  // --- SUBSCRIPTION Resource ---
  { action: ActionEnum.CREATE, resource: ResourceEnum.SUBSCRIPTION, scope: ScopeEnum.ALL, description: 'Create subscriptions (Admin/System)' },
  { action: ActionEnum.READ, resource: ResourceEnum.SUBSCRIPTION, scope: ScopeEnum.SELF, description: 'View own subscription' },
  { action: ActionEnum.READ, resource: ResourceEnum.SUBSCRIPTION, scope: ScopeEnum.ALL, description: 'View all subscriptions' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.SUBSCRIPTION, scope: ScopeEnum.SELF, description: 'Cancel own subscription' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.SUBSCRIPTION, scope: ScopeEnum.ALL, description: 'Cancel any subscription' },

  // --- ADMIN_STATS Resource ---
  { action: ActionEnum.READ, resource: ResourceEnum.ADMIN_STATS, scope: ScopeEnum.ALL, description: 'View global admin stats' },

  // --- CONTACT_US Resource ---
  { action: ActionEnum.READ, resource: ResourceEnum.CONTACT_US, scope: ScopeEnum.ALL, description: 'View all contact submissions' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.CONTACT_US, scope: ScopeEnum.ALL, description: 'Update contact submission status' },

  // --- HELP Resource ---
  { action: ActionEnum.CREATE, resource: ResourceEnum.HELP, scope: ScopeEnum.SELF, description: 'Create help ticket' },
  { action: ActionEnum.READ, resource: ResourceEnum.HELP, scope: ScopeEnum.SELF, description: 'View own help tickets' },
  { action: ActionEnum.READ, resource: ResourceEnum.HELP, scope: ScopeEnum.ALL, description: 'View all help tickets (Admin)' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.HELP, scope: ScopeEnum.ALL, description: 'Reply/Update help tickets (Admin)' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.HELP, scope: ScopeEnum.SELF, description: 'User reply to own help ticket' },

  // --- LLM_CONFIG Resource ---
  { action: ActionEnum.CREATE, resource: ResourceEnum.LLM_CONFIG, scope: ScopeEnum.SELF, description: 'Create LLM configurations' },
  { action: ActionEnum.READ, resource: ResourceEnum.LLM_CONFIG, scope: ScopeEnum.SELF, description: 'View own LLM configurations' },
  { action: ActionEnum.UPDATE, resource: ResourceEnum.LLM_CONFIG, scope: ScopeEnum.SELF, description: 'Update own LLM configurations' },
  { action: ActionEnum.DELETE, resource: ResourceEnum.LLM_CONFIG, scope: ScopeEnum.SELF, description: 'Delete own LLM configurations' },
];

const roles: RoleData[] = [
  {
    name: RoleEnum.ADMIN,
    description: "Full system access",
    permissions: [
      // User Management
      `${ActionEnum.CREATE}:${ResourceEnum.USER}:${ScopeEnum.ALL}`,
      `${ActionEnum.READ}:${ResourceEnum.USER}:${ScopeEnum.ALL}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.USER}:${ScopeEnum.ALL}`,
      `${ActionEnum.DELETE}:${ResourceEnum.USER}:${ScopeEnum.ALL}`,

      // Dashboard
      `${ActionEnum.READ}:${ResourceEnum.DASHBOARD}:${ScopeEnum.ALL}`,

      // Roles
      `${ActionEnum.CREATE}:${ResourceEnum.ROLE}:${ScopeEnum.ALL}`,
      `${ActionEnum.READ}:${ResourceEnum.ROLE}:${ScopeEnum.ALL}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.ROLE}:${ScopeEnum.ALL}`,
      `${ActionEnum.DELETE}:${ResourceEnum.ROLE}:${ScopeEnum.ALL}`,

      // Plans
      `${ActionEnum.CREATE}:${ResourceEnum.PLAN}:${ScopeEnum.ALL}`,
      `${ActionEnum.READ}:${ResourceEnum.PLAN}:${ScopeEnum.ALL}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.PLAN}:${ScopeEnum.ALL}`,
      `${ActionEnum.DELETE}:${ResourceEnum.PLAN}:${ScopeEnum.ALL}`,

      // Subscriptions
      `${ActionEnum.CREATE}:${ResourceEnum.SUBSCRIPTION}:${ScopeEnum.ALL}`,
      `${ActionEnum.READ}:${ResourceEnum.SUBSCRIPTION}:${ScopeEnum.ALL}`,
      `${ActionEnum.DELETE}:${ResourceEnum.SUBSCRIPTION}:${ScopeEnum.ALL}`,

      // Stats
      `${ActionEnum.READ}:${ResourceEnum.ADMIN_STATS}:${ScopeEnum.ALL}`,

      // Contact Us
      `${ActionEnum.READ}:${ResourceEnum.CONTACT_US}:${ScopeEnum.ALL}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.CONTACT_US}:${ScopeEnum.ALL}`,

      // Help
      `${ActionEnum.READ}:${ResourceEnum.HELP}:${ScopeEnum.ALL}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.HELP}:${ScopeEnum.ALL}`,

      // Chatbots (Admin might want to see/manage all)
      `${ActionEnum.READ}:${ResourceEnum.CHATBOT}:${ScopeEnum.ALL}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.CHATBOT}:${ScopeEnum.ALL}`,
      `${ActionEnum.DELETE}:${ResourceEnum.CHATBOT}:${ScopeEnum.ALL}`,

      // Documents (Admin manage all)
      `${ActionEnum.READ}:${ResourceEnum.DOCUMENT}:${ScopeEnum.ALL}`,
      `${ActionEnum.DELETE}:${ResourceEnum.DOCUMENT}:${ScopeEnum.ALL}`,
    ],
  },
  {
    name: RoleEnum.USER,
    description: "Standard user access",
    permissions: [
      `${ActionEnum.READ}:${ResourceEnum.PROFILE}:${ScopeEnum.SELF}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.PROFILE}:${ScopeEnum.SELF}`,
      
      `${ActionEnum.READ}:${ResourceEnum.DASHBOARD}:${ScopeEnum.SELF}`,

      `${ActionEnum.CREATE}:${ResourceEnum.CHATBOT}:${ScopeEnum.SELF}`,
      `${ActionEnum.READ}:${ResourceEnum.CHATBOT}:${ScopeEnum.SELF}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.CHATBOT}:${ScopeEnum.SELF}`,
      `${ActionEnum.DELETE}:${ResourceEnum.CHATBOT}:${ScopeEnum.SELF}`,

      `${ActionEnum.CREATE}:${ResourceEnum.DOCUMENT}:${ScopeEnum.SELF}`,
      `${ActionEnum.READ}:${ResourceEnum.DOCUMENT}:${ScopeEnum.SELF}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.DOCUMENT}:${ScopeEnum.SELF}`,
      `${ActionEnum.DELETE}:${ResourceEnum.DOCUMENT}:${ScopeEnum.SELF}`,

      `${ActionEnum.CREATE}:${ResourceEnum.CHAT}:${ScopeEnum.SELF}`,
      `${ActionEnum.READ}:${ResourceEnum.CHAT}:${ScopeEnum.SELF}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.CHAT}:${ScopeEnum.SELF}`,
      `${ActionEnum.DELETE}:${ResourceEnum.CHAT}:${ScopeEnum.SELF}`,

      `${ActionEnum.CREATE}:${ResourceEnum.HELP}:${ScopeEnum.SELF}`,
      `${ActionEnum.READ}:${ResourceEnum.HELP}:${ScopeEnum.SELF}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.HELP}:${ScopeEnum.SELF}`,

      `${ActionEnum.READ}:${ResourceEnum.SUBSCRIPTION}:${ScopeEnum.SELF}`,
      `${ActionEnum.DELETE}:${ResourceEnum.SUBSCRIPTION}:${ScopeEnum.SELF}`,

      `${ActionEnum.CREATE}:${ResourceEnum.LLM_CONFIG}:${ScopeEnum.SELF}`,
      `${ActionEnum.READ}:${ResourceEnum.LLM_CONFIG}:${ScopeEnum.SELF}`,
      `${ActionEnum.UPDATE}:${ResourceEnum.LLM_CONFIG}:${ScopeEnum.SELF}`,
      `${ActionEnum.DELETE}:${ResourceEnum.LLM_CONFIG}:${ScopeEnum.SELF}`,
    ],
  },
];

export class RBACSeeder {
  async clearAllRBACData(): Promise<void> {
    try {
      logger.info("🧹 Clearing all RBAC data...");

      const usersWithRoles = await User.find({ roles: { $ne: [] } });
      for (const user of usersWithRoles) {
        user.roles = [];
        await user.save();
      }
      logger.info(`🧹 Cleared roles from ${usersWithRoles.length} users`);

      const deletedRoles = await RoleModel.deleteMany({});
      logger.info(`🧹 Deleted ${deletedRoles.deletedCount} roles`);

      // Drop legacy index if exists to allow scoped permissions
      try {
          const indexes = await Permission.collection.indexes();
          console.log('Current Indexes:', indexes);
          await Permission.collection.dropIndex('action_1_resource_1');
          console.log('🗑️ Dropped legacy index action_1_resource_1');
      } catch (error) {
          console.error('Failed to drop index:', error);
      }

      const deletedPermissions = await Permission.deleteMany({});
      logger.info(`🧹 Deleted ${deletedPermissions.deletedCount} permissions`);

      logger.info("✅ All RBAC data cleared successfully!");
    } catch (error) {
      logger.error("❌ Error clearing RBAC data:", error);
      throw error;
    }
  }

  async seedPermissions(): Promise<void> {
    try {
      logger.info("🌱 Seeding permissions...");

      for (const permData of permissions) {
        const existingPermission = await Permission.findOne({
          action: permData.action,
          resource: permData.resource,
          scope: permData.scope,
        });

        if (!existingPermission) {
          await Permission.create(permData);
          logger.info(
            `✅ Created permission: ${permData.action}:${permData.resource}:${permData.scope}`
          );
        } else {
          logger.info(
            `⏭️  Permission already exists: ${permData.action}:${permData.resource}:${permData.scope}`
          );
        }
      }

      logger.info("✅ Permissions seeding completed");
    } catch (error) {
      logger.error("❌ Error seeding permissions:", error);
      throw error;
    }
  }

  async seedRoles(): Promise<void> {
    try {
      logger.info("🌱 Seeding roles...");

      for (const roleData of roles) {
        const existingRole = await RoleModel.findOne({ name: roleData.name });

        if (!existingRole) {
          const rolePermissions = [];

          for (const permissionStr of roleData.permissions) {
            const [action, resource, scope] = permissionStr.split(":");
            const permission = await Permission.findOne({ action, resource, scope });

            if (permission) {
              rolePermissions.push(permission._id);
            } else {
              logger.warn(`⚠️  Permission not found: ${permissionStr}`);
            }
          }

          await RoleModel.create({
            name: roleData.name,
            description: roleData.description,
            permissions: rolePermissions,
          });

          logger.info(
            `✅ Created role: ${roleData.name} with ${rolePermissions.length} permissions`
          );
        } else {
          const rolePermissions = [];

          for (const permissionStr of roleData.permissions) {
            const [action, resource, scope] = permissionStr.split(":");
            const permission = await Permission.findOne({ action, resource, scope });

            if (permission) {
              rolePermissions.push(permission._id);
            }
          }

          existingRole.permissions = rolePermissions as mongoose.Types.ObjectId[];
          await existingRole.save();

          logger.info(
            `🔄 Updated role: ${roleData.name} with ${rolePermissions.length} permissions`
          );
        }
      }

      logger.info("✅ Roles seeding completed");
    } catch (error) {
      logger.error("❌ Error seeding roles:", error);
      throw error;
    }
  }

  async assignDefaultRolesToExistingUsers(): Promise<void> {
    try {
      logger.info("🌱 Assigning default roles to existing users...");

      const userRole = await RoleModel.findOne({ name: RoleEnum.USER });
      const adminRole = await RoleModel.findOne({ name: RoleEnum.ADMIN });

      if (!userRole || !adminRole) {
        throw new Error("Default roles not found. Please seed roles first.");
      }

      const users = await User.find({ roles: { $size: 0 } });

      for (const user of users) {
        user.roles = [userRole._id as mongoose.Types.ObjectId];
        await user.save();
        logger.info(`✅ Assigned default user role to: ${user.email}`);
      }

      logger.info(`✅ Assigned default roles to ${users.length} users`);
    } catch (error) {
      logger.error("❌ Error assigning roles to users:", error);
      throw error;
    }
  }

  async seedAll(): Promise<void> {
    try {
      logger.info("🚀 Starting RBAC seeding process...");

      await this.seedPermissions();
      await this.seedRoles();
      await this.assignDefaultRolesToExistingUsers();

      logger.info("🎉 RBAC seeding completed successfully!");
    } catch (error) {
      logger.error("❌ RBAC seeding failed:", error);
      throw error;
    }
  }

  async clearAndReseedAll(): Promise<void> {
    try {
      logger.info("🔄 Starting clear and reseed process...");

      await this.clearAllRBACData();
      await this.seedAll();

      logger.info("🎉 Clear and reseed completed successfully!");
    } catch (error) {
      logger.error("❌ Clear and reseed failed:", error);
      throw error;
    }
  }
}

export const rbacSeeder = new RBACSeeder();
