import app from "./app.js";
import pool from "./src/config/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test DB connection
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
