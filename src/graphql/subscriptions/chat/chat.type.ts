import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class ChatMessage {
  @Field()
  sentTo: string;

  @Field()
  username: string;

  @Field()
  body: string;

  @Field(() => Date)
  timestamp: Date;
}
