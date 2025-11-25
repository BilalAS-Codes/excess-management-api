import express from 'express'
import cors from 'cors';
import authRoutes from './src/modules/auth/auth.routes.js'

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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

export default app;