import type { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";

export interface RequestWithId extends Request { id?: string }

export function requestId(req: RequestWithId, res: Response, next: NextFunction) {
  const incoming = req.header("x-request-id");
  const id = (incoming && /^[A-Za-z0-9_-]{6,64}$/.test(incoming)) ? incoming : nanoid(12);
  req.id = id;
  res.setHeader("x-request-id", id);
  next();
}
