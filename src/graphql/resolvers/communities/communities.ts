import { ApolloError } from "apollo-server";
import Users from "../../../db/modules/Users";
import { MyCtx } from "src/graphql/types";
import { Ctx, Query, Resolver } from "type-graphql";
import { Community } from "./communities.type";

@Resolver()
export class CommunityResolver {
  @Query(() => [Community])
  async getMyCommunities(@Ctx() { userId }: MyCtx) {
    try {
      if (!userId) {
        return new ApolloError("there is no logged in user");
      }
      const communities = await Users.getCommunities(userId);
      return communities;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
}
