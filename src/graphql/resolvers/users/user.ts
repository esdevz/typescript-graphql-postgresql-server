import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Credentials, LoginCredentials, User } from "./user.type";
import Users from "../../../db/modules/Users";
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from "apollo-server";
import argon2 from "argon2";
import { MyCtx } from "src/graphql/types";

@Resolver()
export class UserResolver {
  @Query(() => User)
  async me(@Ctx() { userId }: MyCtx) {
    try {
      if (!userId) {
        return new ApolloError("there is no logged in user");
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

  @Mutation(() => User)
  async updateAvatar(
    @Arg("newAvatar") newAvatar: string,
    @Ctx() { userId }: MyCtx
  ) {
    if (!userId) {
      return new AuthenticationError("not autorized");
    }
    try {
      const updatedUser = await Users.updateAvatar(newAvatar, userId);
      return updatedUser;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyCtx) {
    return new Promise((resolve) => {
      res.clearCookie("UAT");
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
          return resolve(true);
        }
      });
      return resolve(true);
    });
  }
}
