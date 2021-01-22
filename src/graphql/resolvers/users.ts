import { Arg, Mutation, Resolver } from "type-graphql";
import { Credentials, User } from "../typeDefs/users";
import Users from "../../db/modules/Users";
import { validate } from "class-validator";

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("credentials") { username, email, password }: Credentials
  ) {
    const errors = await validate({ username, email, password });
    if (errors.length > 0) {
      console.log(errors);
    }
    const user = await Users.register(username, email, password);
    return user;
  }
}
