import { MySessionData } from "src/graphql/types";

export const getSession = (session: MySessionData): number | null => {
  const userId = session.userId;

  if (!userId) {
    return null;
  }
  return userId;
};
