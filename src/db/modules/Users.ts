import { User } from "src/graphql/typeDefs/users";
import pool from "../client";

export default {
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const user = await pool.query(
        "INSERT INTO users(username , email , password) VALUES($1,$2,$3) RETURNING *",
        [username, email, password]
      );
      return user.rows[0];
    } catch (err) {
      console.error(err);
      return null;
    }
  },
};
