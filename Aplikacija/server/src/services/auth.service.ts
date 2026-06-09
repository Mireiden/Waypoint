import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

import config from "../config/config.js";
import { AppError } from "../errors/appError.js";
import { prisma } from "../lib/prisma.js";

export const register = async (data: RegisterInput) => {
  const { name, password } = data;
  const email: string = data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) throw new AppError("Email already in use", 409);

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
  const email: string = data.email.trim().toLowerCase();
  const { password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new AppError("Invalid email or password.", 401);

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new AppError("Invalid email or password.", 401);

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
