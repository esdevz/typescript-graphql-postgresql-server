import {
  Arg,
  Ctx,
  ID,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { ChatMessage } from "./chat.type";
import Messages from "../../../db/modules/Messages";
import { MyCtx } from "src/graphql/types";

@Resolver()
export class Chat {
  @Mutation(() => String)
  async sendMsg(
    @PubSub() pubsub: PubSubEngine,
    @Arg("to", () => ID) to: string,
    @Arg("body") body: string,
    @Arg("username") username: string,
    @Arg("id", () => ID) id: string
  ): Promise<string> {
    try {
      let timestamp = Date.now();
      await Messages.addMessage(
        parseInt(to),
        parseInt(id),
        username,
        body,
        timestamp
      );
      await pubsub.publish(to, {
        sub: to,
        username,
        id,
        body: body || "...",
        timestamp,
      });
      return "message sent";
    } catch (err) {
      console.error(err);
      return "cannot send message , try again later";
    }
  }

  @Query(() => [ChatMessage])
  async getMessages(
    @Ctx() { userId }: MyCtx,
    @Arg("subs", () => [ID]) subs: string[]
  ) {
    if (!userId) {
      return [];
    }
    try {
      const messages = await Messages.getMessages(
        subs.map((sub) => parseInt(sub))
      );

      return messages;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  @Subscription({
    topics: ({ args }) => args.mySubs,
  })
  messages(
    @Arg("mySubs", () => [ID]) _mySubs: string[],
    @Root()
    msg: ChatMessage
  ): ChatMessage {
    return msg;
  }
}
