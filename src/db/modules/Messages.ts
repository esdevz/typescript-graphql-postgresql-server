import pool from "../client";
import { formatMsgQuery } from "../../utils";
import { ChatMessage } from "../../graphql/subscriptions/chat/chat.type";

export default {
  async addMessage(
    sub: number,
    id: number,
    username: string,
    body: string,
    timestamp: number
  ): Promise<string> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `insert into messages(sub ,id ,username , body , timestamp ) values($1,$2,$3,$4,$5)`,
        [sub, id, username, body, timestamp]
      );
      await client.query("COMMIT");
      return "message saved";
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      return "cannot save message";
    } finally {
      client.release();
    }
  },
  async getMessages(subs: number[]): Promise<ChatMessage[]> {
    try {
      let queryString = formatMsgQuery("sub", subs);
      const messages = await pool.query(
        `select sub ,id ,username , body , timestamp from messages
             where (${queryString})`,
        subs
      );

      return messages.rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  },
};
