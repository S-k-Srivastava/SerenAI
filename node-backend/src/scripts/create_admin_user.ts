import mongoose from 'mongoose';
import DatabaseConnection from '../config/database/connection.js';
import logger from '../utils/logger/index.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';

const email = process.argv[2];

if (!email) {
    logger.error("❌ Please provide an email address as an argument.");
    process.exit(1);
}

const createAdminUser = async () => {
    try {
        const databaseConn = DatabaseConnection.getInstance();
        await databaseConn.connect();

        logger.info(`🔍 Finding user with email: ${email}...`);
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error(`User with email ${email} not found.`);
        }

        logger.info(`🔍 Finding 'admin' role...`);
        const adminRole = await Role.findOne({ name: 'admin' });

        if (!adminRole) {
            throw new Error("'admin' role not found. Please seed roles first.");
        }

        logger.info(`🔄 Assigning admin role to user...`);
        // Append admin role instead of overriding (keep existing roles)
        const adminRoleId = adminRole._id as mongoose.Types.ObjectId;
        const existingRoleIds = user.roles.map(r => (r as mongoose.Types.ObjectId).toString());
        if (!existingRoleIds.includes(adminRoleId.toString())) {
            (user.roles as mongoose.Types.ObjectId[]).push(adminRoleId);
        }
        await user.save();

        logger.info(`✅ Successfully assigned admin role to user: ${user.email}`);

        // Log full user to verify
        const updatedUser = await User.findById(user._id).populate('roles');
        logger.info(`👤 Updated User Roles:`, updatedUser?.roles);

        await databaseConn.disconnect();
        process.exit(0);
    } catch (error) {
        logger.error("❌ Failed to assign admin role:", error);
        process.exit(1);
    }
};

void createAdminUser();
