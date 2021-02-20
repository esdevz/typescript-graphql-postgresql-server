import { Community } from "src/graphql/resolvers/communities/communities.type";
import { Contact } from "../../graphql/resolvers/users/contacts.type";
import { User } from "src/graphql/resolvers/users/user.type";
import pool from "../client";
import { formatQuery } from "../../utils/index";

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
        `UPDATE users SET avatar=$1 WHERE id=${userId} RETURNING id username email avatar created_at`,
        [newAvatart]
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
  async getCommunities(userId: number): Promise<Community[] | null> {
    try {
      const communities = await pool.query(
        `SELECT id , name ,cover , cover_image , description , comm_admin FROM members
      INNER JOIN communities ON communities.id = members.community_id WHERE member_id = $1`,
        [userId]
      );
      if (communities.rows.length === 0) {
        return null;
      }

      return communities.rows;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  async createGroup(
    name: string,
    cover: string,
    cover_image: string,
    description: string,
    user_id: number
  ): Promise<Community> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const group = await client.query(
        `WITH created_comm AS ( INSERT INTO communities 
              (name , cover , cover_image , description , comm_admin )
                  values
              ($1 , $2 ,$3, $4, $5 )
              RETURNING *
            ) , add_members AS (
             INSERT INTO members (community_id , member_id)
              select id , comm_admin from created_comm
            )
            select id ,name , cover , cover_image , description , comm_admin from created_comm`,
        [name, cover, cover_image, description, user_id]
      );
      await client.query("COMMIT");
      return group.rows[0];
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
           values($1 , $2)
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
  async getContactList(): Promise<Contact[]> {
    try {
      const contactList = await pool.query(
        `select id , username , avatar from users`
      );
      return contactList.rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  async addMembers(users: number[]): Promise<string> {
    const client = await pool.connect();
    try {
      let queryString = formatQuery(users);
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO members(community_id , member_id) values ${queryString}`,
        users
      );
      await client.query("COMMIT");
      return "members added";
    } catch (err) {
      console.error(err);
      return "an error accured while adding members";
    }
  },
};
