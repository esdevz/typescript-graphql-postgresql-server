import dotenv from "dotenv";
import { Client } from "pg";
dotenv.config();

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: 5432,
});

(async function startServer() {
  try {
    await client.connect();
    const res = await client.query("SELECT * FROM posts");
    console.log(res.rows);
  } catch (err) {
    console.log(err);
  }
})();
