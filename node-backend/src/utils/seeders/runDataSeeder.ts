import { dataSeeder } from "./dataSeeder.js";
import DatabaseConnection from "../../config/database/connection.js";
import logger from "../logger/index.js";

const runDataSeeder = async () => {
    try {
        const databaseConn = DatabaseConnection.getInstance();
        await databaseConn.connect();

        logger.info("🌱 Starting data seeding...");
        await dataSeeder.seedAll();
        logger.info("✅ Data seeding completed successfully!");

        await databaseConn.disconnect();
    } catch (error) {
        logger.error("❌ Data seeding failed:", error);
        process.exit(1);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    void runDataSeeder();
}
