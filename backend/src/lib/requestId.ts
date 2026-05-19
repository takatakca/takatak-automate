import type { Request, Response, NextFunction, RequestHandler } from "express";
import { nanoid } from "nanoid";

export type RequestWithId = Request & { id?: string };

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id");
  const id = (incoming && /^[A-Za-z0-9_-]{6,64}$/.test(incoming)) ? incoming : nanoid(12);
  (req as RequestWithId).id = id;
  res.setHeader("x-request-id", id);
  next();
};
