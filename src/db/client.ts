import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    requestCert: true,
    rejectUnauthorized: false,
  },
});

export default pool;
