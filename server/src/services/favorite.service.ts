import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";

export const findByUserId = async (userId: number) => {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      destination: {
        select: {
          id: true,
          title: true,
          type: true,
          city: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
  });
  //flattens the output to only the destination rows
  return rows.map((r) => r.destination);
};

export const add = async (userId: number, destinationId: number) => {
  const dest = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { id: true },
  });
  if (!dest) throw new NotFoundError("Invalid destinationId");

  return await prisma.favorite.upsert({
    where: {
      userId_destinationId: {
        userId,
        destinationId,
      },
    },
    create: { userId, destinationId },
    update: {},
  });
};

export const remove = async (userId: number, destinationId: number) => {
  await prisma.favorite.deleteMany({ where: { userId, destinationId } });
};
