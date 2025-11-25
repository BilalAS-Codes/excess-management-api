import { Pool } from "pg";

const pool = new Pool({
  user: process.env.MASTER_USERNAME,
  host: process.env.HOST,
  database: process.env.DB_NAME,
  password: process.env.MASTER_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },

  idleTimeoutMillis: 10000,
});


export default pool;