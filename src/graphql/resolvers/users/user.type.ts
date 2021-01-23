import { IsEmail, Length, MaxLength } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  created_at: string;
}

@InputType()
export class Credentials {
  @Field()
  @Length(4, 30, { message: "invalid username" })
  username: string;

  @Field()
  @MaxLength(30, { message: "email too long" })
  @IsEmail({}, { message: "invalid email" })
  email: string;

  @Field()
  password: string;
}
