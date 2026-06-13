import type { CreateDestinationInput } from "../schemas/destination.schema.js";

import { createDestination as createDestinationSql } from "../../generated/prisma/sql/createDestination.js";
import { getDestinationById } from "../../generated/prisma/sql/getDestinationById.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";

export const findById = async (id: number) => {
  const [dest] = await prisma.$queryRawTyped(getDestinationById(id));
  if (!dest) throw new NotFoundError();
  return dest;
};

export const createDestination = async (userId: number, data: CreateDestinationInput) => {
  const { title, description, type, geometry, city, country, categoryId } = data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new BadRequestError("Invalid categoryId");

  const [dest] = await prisma.$queryRawTyped(
    createDestinationSql(
      title,
      description ?? null,
      type,
      geometry,
      city ?? null,
      country ?? null,
      userId,
      categoryId,
    ),
  );
  return dest;
};
