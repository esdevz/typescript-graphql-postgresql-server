import { Community } from "../../graphql/resolvers/communities/communities.type";
import { formatQuery } from "../../utils/index";
import { Contact } from "../../graphql/resolvers/users/contacts.type";
import pool from "../client";

export default {
  async getCommunities(userId: number): Promise<Community[]> {
    try {
      const communities = await pool.query(
        `SELECT id , name ,cover , cover_image , description , comm_admin FROM members
          INNER JOIN communities ON communities.id = members.community_id WHERE member_id = $1`,
        [userId]
      );
      return communities.rows;
    } catch (err) {
      console.error(err);
      return [];
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
  async getMembers(groupId: number): Promise<Contact[]> {
    try {
      const members = await pool.query(
        `select id , username ,avatar from members
          inner join users on users.id = members.member_id where
          community_id =$1`,
        [groupId]
      );
      return members.rows;
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
