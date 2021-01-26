import { Request, Response } from "express";
import { SessionData } from "express-session";

export interface MySessionData extends SessionData {
  userId?: number;
}

export type MyCtx = {
  req: Request & { session: MySessionData };
  res: Response;
  userId: number | null;
};
