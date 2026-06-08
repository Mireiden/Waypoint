import type { Role } from "../../generated/prisma/client.js";

export type AuthUser = {
  id: number;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
