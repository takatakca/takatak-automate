import type { Request, Response, NextFunction } from "express";
import { captureException } from "../lib/sentry.js";
import type { RequestWithId } from "../lib/requestId.ts";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "not_found" });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  const reqId = (req as RequestWithId).id;
  const message = err instanceof Error ? err.message : "unknown_error";
  // Safe production log: no payload, no headers, no secrets.
  console.error(JSON.stringify({
    level: "error",
    requestId: reqId,
    method: req.method,
    path: req.path,
    message,
  }));
  captureException(err, { requestId: reqId, path: req.path });
  res.status(500).json({ error: "internal_error", requestId: reqId });
}
