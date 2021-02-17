import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class ChatMessage {
  @Field()
  sub: string;

  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  body: string;

  @Field()
  timestamp: number;
}
