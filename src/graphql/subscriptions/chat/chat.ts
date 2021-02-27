import {
  Arg,
  ID,
  Mutation,
  PubSub,
  PubSubEngine,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { ChatMessage } from "./chat.type";

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
      await pubsub.publish(to, {
        sub: to,
        username,
        id,
        body: body || "...",
        timestamp: Date.now(),
      });
      return "message sent";
    } catch (err) {
      console.error(err);
      return "cannot send message , try again later";
    }
  }

  @Subscription({
    topics: ({ args }) => args.mySubs,
  })
  messages(
    @Arg("mySubs", () => [ID]) mySubs: string[],
    @Root()
    msg: ChatMessage
  ): ChatMessage {
    return msg;
  }
}
