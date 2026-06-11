import type { UpdateProfileInput } from "../schemas/user.schema.js";

import { AppError } from "../errors/appError.js";
import { prisma } from "../lib/prisma.js";

export const findAll = async () => {
  return prisma.user.findMany({
    omit: {
      passwordHash: true,
    },
    include: {
      _count: { select: { destinations: true, reviews: true, reports: true } },
    },
  });
};

export const findById = async (id: number) => {
  const user = await prisma.user.findUnique({
    omit: {
      passwordHash: true,
    },
    where: { id },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const findByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const updateProfile = async (id: number, data: UpdateProfileInput) => {
  return prisma.user.update({
    where: { id },
    data: Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)),
    omit: {
      passwordHash: true,
    },
  });
};

export const deleteUser = async (id: number) => {
  await prisma.user.delete({
    where: { id },
  });
};
