import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import type { Role } from "../../generated/prisma/enums.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

import config from "../config/config.js";
import { ConflictError, UnauthorizedError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";

const signAccessToken = (user: { id: number; role: Role }) =>
  jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

const hashToken = (raw: string) => crypto.createHash("sha256").update(raw).digest("hex");

const issueRefreshToken = async (userId: number) => {
  const raw = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + config.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { tokenHash: hashToken(raw), userId, expiresAt },
  });

  return raw;
};

export const register = async (data: RegisterInput) => {
  const { name, email, password } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError("Email already in use");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    omit: { passwordHash: true },
  });

  const token = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);

  return { token, refreshToken, user };
};

export const login = async (data: LoginInput) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError("Invalid email or password.");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new UnauthorizedError("Invalid email or password.");

  const token = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
  };

  return { user: safeUser, token, refreshToken };
};

export const refresh = async (rawToken: string) => {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  if (!stored) throw new UnauthorizedError("Invalid refresh token.");

  // consume the presented token no matter what happens next
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  if (stored.expiresAt < new Date()) throw new UnauthorizedError("Refresh token expired.");

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) throw new UnauthorizedError("Invalid refresh token.");

  const token = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);

  return { user, token, refreshToken };
};

export const revokeRefreshToken = async (rawToken: string) => {
  await prisma.refreshToken.deleteMany({ where: { tokenHash: hashToken(rawToken) } });
};
