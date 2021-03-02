import { IsEmail, Length, MaxLength, MinLength } from "class-validator";
import { IsUnique } from "../../../decorators/IsUnique";
import { Field, ID, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  created_at: string;
}

@InputType()
export class Credentials {
  @Field()
  @Length(4, 30, { message: "invalid username" })
  @IsUnique({ message: "username is taken" })
  username: string;

  @Field()
  @MaxLength(30, { message: "email too long" })
  @IsEmail({}, { message: "invalid email" })
  @IsUnique({ message: "this email is already registered" })
  email: string;

  @Field()
  @MinLength(6, { message: "minimum password length is 6" })
  password: string;
}

@InputType()
export class LoginCredentials {
  @Field()
  @MaxLength(30, { message: "email too long" })
  @IsEmail({}, { message: "invalid email" })
  email: string;

  @Field()
  @MinLength(6, { message: "minimum password length is 6" })
  password: string;
}
