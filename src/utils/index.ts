import { MySessionData } from "src/graphql/types";

export const getSession = (session: MySessionData): number | null => {
  const userId = session.userId;

  if (!userId) {
    return null;
  }
  return userId;
};

export const containsStr = (source: string, target: string[]): boolean => {
  return target.every((str) => source.includes(str));
};
