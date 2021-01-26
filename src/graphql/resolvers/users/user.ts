import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Credentials, LoginCredentials, User } from "./user.type";
import Users from "../../../db/modules/Users";
import { AuthenticationError, UserInputError } from "apollo-server";
import argon2 from "argon2";
import { MyCtx } from "src/graphql/types";

@Resolver()
export class UserResolver {
  @Query(() => User)
  async me(@Ctx() { userId }: MyCtx) {
    try {
      if (!userId) {
        return new AuthenticationError("not authorized");
      }
      const user = await Users.getUser("id", userId);
      return user;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  @Mutation(() => User)
  async register(
    @Arg("credentials") { username, email, password }: Credentials,
    @Ctx() { req }: MyCtx
  ) {
    try {
      const exists = await Users.getUser("email", email);
      if (exists) {
        return new UserInputError("user already exists");
      }
      const hashedPass = await argon2.hash(password);
      const user = await Users.register(username, email, hashedPass);
      req.session.userId = user.id;
      return user;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  @Mutation(() => User)
  async login(
    @Arg("credentials") { email, password }: LoginCredentials,
    @Ctx() { req }: MyCtx
  ) {
    try {
      const user = await Users.getUser("email", email);
      if (!user) {
        return new UserInputError("invalid credentials");
      }

      const validPass = await argon2.verify(user.password, password);
      if (!validPass) {
        return new UserInputError("invalid credentials");
      }
      req.session.userId = user.id;
      return user;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
}
