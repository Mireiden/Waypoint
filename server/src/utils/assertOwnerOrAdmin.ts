import type { AuthUser } from "../schemas/auth.schema.js";

import { ForbiddenError } from "../errors/forbiddenError.js";

export const assertOwnerOrAdmin = (actor: AuthUser, ownerId: number | undefined) => {
  if (actor.role !== "admin" && actor.id !== ownerId) {
    throw new ForbiddenError();
  }
};
