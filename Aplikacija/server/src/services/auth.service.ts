import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

import config from "../config/config.js";
import { ConflictError, UnauthorizedError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";

export const register = async (data: RegisterInput) => {
  const { name, email, password } = data;
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) throw new ConflictError("Email already in use");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    omit: {
      passwordHash: true,
    },
  });

  const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  return { token, user };
};

export const login = async (data: LoginInput) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new UnauthorizedError("Invalid email or password.");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new UnauthorizedError("Invalid email or password.");

  const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
  };

  return { user: safeUser, token };
};
