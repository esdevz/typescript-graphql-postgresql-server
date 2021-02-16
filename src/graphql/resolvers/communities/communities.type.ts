import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class Community {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  cover?: string;

  @Field({ nullable: true })
  cover_image?: string;

  @Field(() => ID)
  comm_admin: number;
}
