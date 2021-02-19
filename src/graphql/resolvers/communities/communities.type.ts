import { IsNotEmpty } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";

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
  @IsNotEmpty({ message: "group name is required" })
  name: string;

  @Field({ nullable: true })
  cover?: string;

  @Field({ nullable: true })
  cover_image?: string;

  @Field()
  description: string;
}
