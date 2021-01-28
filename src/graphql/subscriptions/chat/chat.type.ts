import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class ChatMessage {
  @Field()
  sub: string;

  @Field()
  username: string;

  @Field()
  body: string;

  @Field(() => Date)
  timestamp: Date;
}
