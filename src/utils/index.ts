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

export const formatQuery = (list: number[]): string => {
  const values = list.map((_, idx) => `($1 , $${idx + 1})`);
  return values.slice(1).join(",");
};
