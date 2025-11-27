import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFormat = winston.format.printf(({ timestamp, level, message, meta, stack }) => {
  return `${timestamp} | ${level.toUpperCase()} | ${message} | ${
    stack ? stack : meta ? JSON.stringify(meta) : ""
  }`;
});

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    logFormat
  ),

  transports: [
    

    new DailyRotateFile({
      dirname: path.join(__dirname, "../logs/errors"),
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "10d",
      maxSize: "20m",
      zippedArchive: true,
    }),

    new DailyRotateFile({
      dirname: path.join(__dirname, "../logs/server"),
      filename: "combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "10d",
      maxSize: "20m",
      zippedArchive: true,
    }),
  ],
});

export default logger;
