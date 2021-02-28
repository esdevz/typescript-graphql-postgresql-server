import {
  Contact,
  Notifications,
} from "../../graphql/resolvers/users/contacts.type";
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
        "INSERT INTO users(username , email , password) VALUES($1,$2,$3) RETURNING id , username ,email , avatar, created_at",
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
  async updateAvatar(newAvatart: string, userId: number): Promise<User> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const user = await client.query(
        `UPDATE users SET avatar=$1 WHERE id=$2 RETURNING id username email avatar created_at`,
        [newAvatart, userId]
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
  async getMyContacts(userId: number): Promise<Contact[]> {
    try {
      const contacts = await pool.query(
        `select id , username ,avatar from contact_list
       inner join users on users.id = contact_list.contact where
       primary_user =$1 `,
        [userId]
      );
      return contacts.rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  async addContact(userId: number, contactId: number): Promise<Contact> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const contact = await client.query(
        `with new_contact as (
          insert into contact_list(primary_user,contact)
           values($1 , $2) , ($2 , $1)
          returning contact as contact_id
          )
          select  contact_id as id , username , avatar from new_contact inner join users on users.id = contact_id`,
        [userId, contactId]
      );

      await client.query("COMMIT");
      return contact.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      return err;
    } finally {
      client.release();
    }
  },
  async getContactList(search: string, userId: number): Promise<Contact[]> {
    try {
      const contactList = await pool.query(
        `select id , username , avatar from users  where ( username ilike $1 and  NOT EXISTS (
          SELECT  
          FROM   contact_list
          WHERE  id = $2
          ))`,
        [`%${search}%`, userId]
      );
      return contactList.rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  async sendContactRequest(
    senderId: number,
    contactId: number
  ): Promise<string> {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      await client.query(
        `insert into contact_requests(sender_id , contact_id)
        values ($1,$2)`,
        [senderId, contactId]
      );
      await client.query("COMMIT");
      return "contact added";
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      return "error ,cannot add this contact";
    } finally {
      client.release();
    }
  },
  async clearContactRequest(
    senderId: number,
    contactId: number
  ): Promise<string> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `delete from contact_requests where (sender_id = $1 and contact_id = $2)`,
        [senderId, contactId]
      );
      await client.query("COMMIT");
      return "notification cleared";
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      return "problem clearing notification";
    }
  },
  async getNotifications(userId: number): Promise<Notifications> {
    try {
      const [sentRequests, contactRequests] = await Promise.all([
        await pool.query(
          `select contact_id as id from contact_requests where  sender_id =$1`,
          [userId]
        ),
        await pool.query(
          `select id , username ,avatar from contact_requests
        inner join users on users.id = contact_requests.sender_id where
      contact_id = $1`,
          [userId]
        ),
      ]);
      return {
        sent: sentRequests.rows.map((r) => r.id),
        notifications: contactRequests.rows,
      };
    } catch (err) {
      console.error(err);
      return {
        sent: [],
        notifications: [],
      };
    }
  },
};
