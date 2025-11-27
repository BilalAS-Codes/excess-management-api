import logger from "../loggers/logger.js";

export const errorLogger = (err, req, res, next) => {
  logger.error(err.message, {
    meta: {
      name: err.name,
      stack: err.stack,
      reason: err.reason || "Unexpected error",
      method: req.method,
      url: req.originalUrl,
      ip: req.headers["x-forwarded-for"] || req.ip,
      device: {
        os: req.useragent?.os || "unknown",
        browser: req.useragent?.browser || "unknown",
        platform: req.useragent?.platform || "unknown",
        version: req.useragent?.version || "unknown",
      },
      userId: req.user?.id || null,
      body: req.body,
      query: req.query,
      params: req.params,
    },
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: "Internal server error",
  });
};
