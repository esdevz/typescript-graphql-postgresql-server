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
  ): Promise<number> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const count = await client.query(
        `with new_msg as (insert into messages(sub ,id ,username , body , timestamp ) values($1,$2,$3,$4,$5) returning sub )
        select count(msg_id) from messages where sub = (select sub from new_msg) `,
        [sub, id, username, body, timestamp]
      );
      await client.query("COMMIT");
      return parseInt(count.rows[0].count);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      return 0;
    } finally {
      client.release();
    }
  },
  async getMessages(subs: number[]): Promise<ChatMessage[]> {
    try {
      let queryString = formatMsgQuery("sub", subs);
      const messages = await pool.query(
        `select sub ,id ,username , body , timestamp from messages
             where (${queryString}) order by timestamp asc `,
        subs
      );

      return messages.rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  async deleteMessages(sub: number, count: number): Promise<void> {
    const client = await pool.connect();
    try {
      let messagesLimit = count - 50;
      await client.query("BEGIN");
      await client.query(
        `delete from messages where msg_id in
       ( select msg_id from messages where sub = $1 order by msg_id asc limit $2 )`,
        [sub, messagesLimit]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
    } finally {
      client.release();
    }
  },
};
