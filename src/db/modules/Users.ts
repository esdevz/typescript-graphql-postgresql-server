import { User } from "src/graphql/resolvers/users/user.type";
import pool from "../client";

export default {
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const user = await client.query(
        "INSERT INTO users(username , email , password) VALUES($1,$2,$3) RETURNING id , username ,email , created_at",
        [username, email, password]
      );
      await client.query("COMMIT");
      return user.rows[0];
    } catch (err) {
      console.error(err);
      await client.query("ROLLBACK");
      return err;
    } finally {
      client.release();
    }
  },
  async getUser(key: string, value: string | number): Promise<User | null> {
    try {
      const user = await pool.query(`SELECT * FROM users where ${key}= $1`, [
        value,
      ]);
      if (user.rows.length === 0) {
        return null;
      }
      return user.rows[0];
    } catch (err) {
      return null;
    }
  },
};
