import { Request, Response } from "express";
import { createServer } from "./config/server/index.js";
import DatabaseConnection from "./config/database/connection.js";
import { env } from "./config/env/index.js";
import logger from "./utils/logger/index.js";

// Initialize app and database connection
const app = createServer();
const databaseConn = DatabaseConnection.getInstance();

const startServer = async (): Promise<void> => {
  try {
    await databaseConn.connect();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(
        `🏥 Health check available at http://localhost:${env.PORT}/health`
      );
    });

    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("Process terminated");
        void databaseConn.disconnect();
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Only listen in development or production (standalone)
if (env.NODE_ENV === "development" || env.NODE_ENV === "production") {
  void startServer();
}

// Export for serverless (Vercel)
// Export for serverless (Vercel)
export default async (req: Request, res: Response) => {
  try {
    await databaseConn.connect();
    return app(req, res);
  } catch (error) {
    logger.error("Serverless Handler Critical Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? String(error) : undefined
    });
  }
};
