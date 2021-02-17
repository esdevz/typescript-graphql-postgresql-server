import {
  Arg,
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
    @Arg("to") to: string,
    @Arg("body") body: string,
    @Arg("username") username: string,
    @Arg("id") id: string
  ): Promise<string> {
    try {
      await pubsub.publish(to, {
        sub: to,
        username,
        id,
        body,
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
    @Arg("mySubs", () => [String]) mySubs: string[],
    @Root()
    msg: ChatMessage
  ): ChatMessage {
    return msg;
  }
}
