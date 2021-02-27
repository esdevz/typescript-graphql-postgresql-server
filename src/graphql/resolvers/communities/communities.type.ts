import { ArrayMinSize } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import { RequiredString } from "../../../decorators/RequiredString";

@ObjectType()
export class Community {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

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

@InputType()
export class MembersDetails {
  @Field(() => ID)
  groupId: number;

  @Field(() => [ID])
  @ArrayMinSize(1, { message: "members list is empty" })
  users: number[];
}
