import type { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../errors/appError.js";
import { prisma } from "../lib/prisma.js";

export const findAll = async () => {
  return prisma.user.findMany({
    omit: {
      passwordHash: true,
    },
  });
};

export const findById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: {
      passwordHash: true,
    },
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

export const updateProfile = async (id: number, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({
    where: { id },
    data,
    omit: {
      passwordHash: true,
    },
  });
};

export const deleteUser = async (id: number) => {
  const user = await prisma.user.findFirst({
    where: { id },
  });
  if (!user) throw new AppError("User not found", 404);

  await prisma.user.delete({
    where: { id },
  });
};
