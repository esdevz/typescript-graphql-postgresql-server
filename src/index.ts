import "reflect-metadata";
import dotenv from "dotenv";
import { ApolloServer, UserInputError } from "apollo-server-express";
import express from "express";
import http from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./graphql/resolvers/users/user";
import { Hello } from "./graphql/resolvers/hello";
import { Chat } from "./graphql/subscriptions/chat/chat";
import pool from "./db/client";
import { MyCtx } from "./graphql/types";
import { getSession } from "./utils";
dotenv.config();

(async function () {
  const app = express();
  const pgSession = connectPg(session);
  const sessionStore = new pgSession({
    pool,
    tableName: "session",
  });
  app.use(
    session({
      name: "UAT",
      store: sessionStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
      secret: process.env.SECRET!,
      resave: false,
      saveUninitialized: false,
      unset: "destroy",
    })
  );

  const httpServer = http.createServer(app);

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, Hello, Chat],
    }),
    context: ({ req, res, connection }): MyCtx => {
      if (connection) {
        return connection.context;
      }

      return { req, res, userId: getSession(req.session) };
    },
    formatError: (error) => {
      if (error.message.startsWith("Argument Validation Error")) {
        const newError = Object.values(
          error.extensions?.exception.validationErrors[0].constraints
        )[0] as string;
        return new UserInputError(newError);
      } else {
        return error;
      }
    },
  });

  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: process.env.ORIGIN,
      credentials: true,
    },
  });
  apolloServer.installSubscriptionHandlers(httpServer);
  try {
    httpServer.listen(5000, () => {
      console.log(`server started`);
    });
  } catch (err) {
    console.error(err);
  }
})();
