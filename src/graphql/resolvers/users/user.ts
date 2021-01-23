import { Arg, Mutation, Resolver } from "type-graphql";
import { Credentials, LoginCredentials, User } from "./user.type";
import Users from "../../../db/modules/Users";
import { UserInputError } from "apollo-server";
import argon2 from "argon2";

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("credentials") { username, email, password }: Credentials
  ) {
    const exists = await Users.getUser("email", email);
    if (exists) {
      return new UserInputError("user already exists");
    }
    const hashedPass = await argon2.hash(password);
    const user = await Users.register(username, email, hashedPass);
    return user;
  }

  @Mutation(() => User)
  async login(@Arg("credentials") { email, password }: LoginCredentials) {
    try {
      const user = await Users.getUser("email", email);
      if (!user) {
        return new UserInputError("invalid credentials");
      }

      const validPass = await argon2.verify(user.password, password);
      if (!validPass) {
        return new UserInputError("invalid credentials");
      }
      return user;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
}
