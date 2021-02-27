import Users from "../../../db/modules/Users";
import { MyCtx } from "../../types";
import {
  Arg,
  Ctx,
  ID,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
} from "type-graphql";
import { Contact, ContactDetails, Notifications } from "./contacts.type";
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
      const contactList = await Users.getContactList(search, userId);
      return contactList;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  @Query(() => Notifications)
  async getNotifications(@Ctx() { userId }: MyCtx) {
    try {
      if (!userId) {
        return [];
      }
      const myNotifications = await Users.getNotifications(userId);
      return myNotifications;
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
      await Users.clearContactRequest(contactId, userId);
      return contact;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  @Mutation(() => String)
  async sendContactRequest(
    @PubSub() pubsub: PubSubEngine,
    @Arg("from") from: ContactDetails,
    @Arg("contact") contact: ContactDetails,
    @Ctx() { userId }: MyCtx
  ) {
    try {
      if (!userId) {
        return new AuthenticationError("not autorized");
      }
      const status = await Users.sendContactRequest(userId, contact.id);
      await pubsub.publish(contact.username, {
        sub: contact.username,
        id: userId,
        username: from.username,
        body: `${from.username} sent you a friend request`,
        timestamp: Date.now(),
      });
      return status;
    } catch (err) {
      return err;
    }
  }
}
