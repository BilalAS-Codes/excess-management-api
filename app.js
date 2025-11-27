import express from 'express'
import cors from 'cors';
import * as expressUseragent from "express-useragent";



import authRoutes from './src/modules/auth/auth.routes.js'
import { requestLogger } from './src/shared/middleware/request-middleware.js';
import { errorLogger } from './src/shared/middleware/error-logger.js';
const app = express();

app.use(cors());
app.use(expressUseragent.express());


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

//authentication routes
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

app.use(errorLogger);
export default app;