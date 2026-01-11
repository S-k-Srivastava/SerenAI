import { rbacSeeder } from "./rbacSeeder.js";
import DatabaseConnection from "../../config/database/connection.js";
import logger from "../logger/index.js";

export const runSeeders = async (clearFirst: boolean = false): Promise<void> => {
  try {
    const databaseConn = DatabaseConnection.getInstance();
    await databaseConn.connect();

    if (clearFirst) {
      logger.info("🧹 Running seeders with clear option...");
      await rbacSeeder.clearAndReseedAll();
    } else {
      logger.info("🌱 Running all seeders...");
      await rbacSeeder.seedAll();
    }

    logger.info("✅ All seeders completed successfully!");

    await databaseConn.disconnect();
  } catch (error) {
    logger.error("❌ Seeders failed:", error);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const clearFlag = process.argv.includes('--clear') || process.argv.includes('-c');
  void runSeeders(clearFlag);
}