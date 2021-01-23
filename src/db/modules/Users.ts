import { User } from "src/graphql/resolvers/users/user.type";
import pool from "../client";

export default {
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<User | null | Error> {
    try {
      const user = await pool.query(
        "INSERT INTO users(username , email , password) VALUES($1,$2,$3) RETURNING id , username ,email , created_at",
        [username, email, password]
      );
      return user.rows[0];
    } catch (err) {
      console.error(err);
      return err;
    }
  },
  async getUser(key: string, value: string): Promise<User | null> {
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
