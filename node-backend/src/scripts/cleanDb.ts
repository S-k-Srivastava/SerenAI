import mongoose from 'mongoose';
import DatabaseConnection from '../config/database/connection.js';
import logger from '../utils/logger/index.js';

const cleanDb = async () => {
    try {
        const databaseConn = DatabaseConnection.getInstance();
        await databaseConn.connect();

        if (!mongoose.connection.db) {
            throw new Error('Database connection established but db handle is missing');
        }

        const dbName = mongoose.connection.db.databaseName;
        logger.info(`🧹 Clearing database: ${dbName}...`);

        // Drop the entire database
        await mongoose.connection.db.dropDatabase();

        logger.info("✅ Database cleared successfully!");

        await databaseConn.disconnect();
        process.exit(0);
    } catch (error) {
        logger.error("❌ Failed to clear database:", error);
        process.exit(1);
    }
};

void cleanDb();
