import "reflect-metadata";
import { ApolloServer, UserInputError } from "apollo-server-express";
import express from "express";
import dotenv from "dotenv";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./graphql/resolvers/users/user";
import { Hello } from "./graphql/resolvers/hello";
// import { Client } from "pg";
const PORT = 5000 || process.env.PORT;
dotenv.config();

const app = express();

(async function () {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, Hello],
    }),
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
  apolloServer.applyMiddleware({ app });
  app.listen(PORT, () => console.log("server started"));
})();
