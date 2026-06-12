import type { UpdateProfileInput } from "../schemas/user.schema.js";

import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";
import { removeUndefined } from "../utils/removeUndefined.js";

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

export const findPublicProfile = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  if (!user) throw new NotFoundError("User not found");

  return user;
};

export const findById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: {
      passwordHash: true,
    },
  });
  if (!user) throw new NotFoundError("User not found");
  return user;
};

export const updateProfile = async (id: number, data: UpdateProfileInput) => {
  return prisma.user.update({
    where: { id },
    data: removeUndefined(data),
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
