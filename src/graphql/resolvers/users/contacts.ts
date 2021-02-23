import Users from "../../../db/modules/Users";
import { MyCtx } from "../../types";
import { Arg, Ctx, ID, Mutation, Query, Resolver } from "type-graphql";
import { Contact } from "./contacts.type";
import { AuthenticationError } from "apollo-server";

@Resolver()
export class Contacts {
  @Query(() => [Contact])
  async myContacts(@Ctx() { userId }: MyCtx) {
    try {
      if (!userId) {
        return new AuthenticationError("not authorized");
      }
      const contacts = await Users.getMyContacts(userId);
      return contacts;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  @Query(() => [Contact])
  async contactList(@Ctx() { userId }: MyCtx, @Arg("search") search: string) {
    if (!userId) {
      return new AuthenticationError("not authorized");
    }
    try {
      const contactList = await Users.getContactList(search);
      return contactList;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  @Mutation(() => Contact)
  async newContact(
    @Ctx() { userId }: MyCtx,
    @Arg("contact", () => ID) contactId: number
  ) {
    try {
      if (!userId) {
        return new AuthenticationError("not authorized");
      }
      const contact = await Users.addContact(userId, contactId);
      return contact;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
}
