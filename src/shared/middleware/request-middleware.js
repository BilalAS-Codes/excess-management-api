import logger from "../loggers/logger.js";


export const requestLogger = (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.ip;

  logger.info("Incoming request", {
    meta: {
      method: req.method,
      url: req.originalUrl,
      ip,
      device: {
        os: req.useragent?.os || "unknown",
        browser: req.useragent?.browser || "unknown",
        platform: req.useragent?.platform || "unknown",
        version: req.useragent?.version || "unknown",
      },
      userId: req.user?.id || null,
    },
  });

  next();
};

