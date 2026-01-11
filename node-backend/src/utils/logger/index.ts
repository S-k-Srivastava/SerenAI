import winston from "winston";
import path from "path";
import fs from "fs";
import { env } from "../../config/env/index.js";

const logLevel = env.LOG_LEVEL || "info";

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createLogPaths = () => {
  const currentDate = getCurrentDate();
  const logDir = "logs";

  ensureDirectoryExists(logDir);

  return {
    combinedPath: path.join(logDir, `${currentDate}.log`),
  };
};

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
      })
    ),
  }),
];

const { combinedPath } = createLogPaths();

transports.push(
  new winston.transports.File({
    filename: combinedPath,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
      })
    ),
  })
);

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ),
  transports,
});

export default logger;
