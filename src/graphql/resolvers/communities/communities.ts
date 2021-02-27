import { ApolloError, AuthenticationError } from "apollo-server";
import { MyCtx } from "src/graphql/types";
import { Arg, Ctx, ID, Mutation, Query, Resolver } from "type-graphql";
import { Community, GroupDetails, MembersDetails } from "./communities.type";
import { Contact } from "../users/contacts.type";
import Groups from "../../../db/modules/Groups";

@Resolver()
export class CommunityResolver {
  @Query(() => [Community])
  async getMyCommunities(@Ctx() { userId }: MyCtx) {
    try {
      if (!userId) {
        return new ApolloError("there is no logged in user");
      }
      const communities = await Groups.getCommunities(userId);
      return communities;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  @Query(() => [Contact])
  async membersList(
    @Arg("groupId", () => ID) groupId: number,
    @Ctx() { userId }: MyCtx
  ) {
    if (!userId) {
      return new AuthenticationError("not authorized");
    }
    try {
      const members = await Groups.getMembers(groupId);
      return members;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  @Mutation(() => Community)
  async createGroup(
    @Arg("groupDetails")
    { name, cover, cover_image, description }: GroupDetails,
    @Ctx() { userId }: MyCtx
  ) {
    try {
      if (!userId) {
        return new AuthenticationError("not authorized");
      }
      const newGroup = await Groups.createGroup(
        name,
        cover || "",
        cover_image || "",
        description,
        userId
      );
      return newGroup;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  @Mutation(() => String)
  async addMembers(
    @Ctx() { userId }: MyCtx,
    @Arg("members") { groupId, users }: MembersDetails
  ) {
    if (!userId) {
      return new AuthenticationError("not authorized");
    }
    try {
      const status = await Groups.addMembers([groupId, ...users]);
      return status;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
}
