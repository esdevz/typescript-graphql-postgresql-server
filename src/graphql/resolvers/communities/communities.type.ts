import { Field, ID, InputType, ObjectType } from "type-graphql";
import { RequiredString } from "../../../decorators/RequiredString";

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

@InputType()
export class GroupDetails {
  @Field()
  @RequiredString({ message: "group name is required" })
  name: string;

  @Field({ nullable: true })
  cover?: string;

  @Field({ nullable: true })
  cover_image?: string;

  @Field()
  @RequiredString({ message: "group description is required" })
  description: string;
}
