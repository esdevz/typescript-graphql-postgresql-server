import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class Contact {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  username: string;
}
