import { Arg, Mutation, Resolver } from "type-graphql";
import { Credentials, User } from "./user.type";
import Users from "../../../db/modules/Users";

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("credentials") { username, email, password }: Credentials
  ) {
    const user = await Users.register(username, email, password);
    return user;
  }
}
