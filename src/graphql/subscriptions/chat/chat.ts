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
    @Arg("username") username: string
  ): Promise<string> {
    try {
      await pubsub.publish(to, {
        username,
        body,
        timestamp: new Date(),
      });
      return "message sent";
    } catch (err) {
      console.error(err);
      return "cannot send message , try again later";
    }
  }

  @Subscription({
    topics: ({ args }) => args.to,
  })
  messages(
    @Arg("to") to: string,
    @Root()
    msg: ChatMessage
  ): ChatMessage {
    return { ...msg, sentTo: to };
  }
}
