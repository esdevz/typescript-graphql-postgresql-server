import { Field, ID, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class Contact {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  username: string;
}

@InputType()
export class ContactDetails {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  username: string;
}

@ObjectType()
export class Notifications {
  @Field(() => [ID])
  sent: number[];

  @Field(() => [Contact])
  notifications: Contact[];
}
