import type { Request } from "express";

import type { AuthUser } from "../schemas/auth.schema.js";

import { UnauthorizedError } from "../errors/unauthorizedError.js";

export function assertAuth(req: Request): asserts req is Request & { user: AuthUser } {
  if (!req.user) throw new UnauthorizedError();
}
