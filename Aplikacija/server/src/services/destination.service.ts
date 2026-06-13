import type { AuthUser } from "../schemas/auth.schema.js";
import type { CreateDestinationInput } from "../schemas/destination.schema.js";

import { createDestination as createDestinationSql } from "../../generated/prisma/sql/createDestination.js";
import { getDestinationById } from "../../generated/prisma/sql/getDestinationById.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";
import { reverseGeocode } from "./geocoding.service.js";

export const findById = async (id: number) => {
  const [dest] = await prisma.$queryRawTyped(getDestinationById(id));
  if (!dest) throw new NotFoundError();
  return dest;
};

export const createDestination = async (userId: number, data: CreateDestinationInput) => {
  const { title, description, type, geometry, categoryId } = data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new BadRequestError("Invalid categoryId");

  const coords = data.type === "point" ? data.geometry.coordinates : data.geometry.coordinates[0];
  if (!coords) throw new BadRequestError("Invalid geometry");
  const [lng, lat] = coords;

  const { city, country } = await reverseGeocode(lng, lat);

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

export const deleteDestination = async (id: number, actor: AuthUser) => {
  const dest = await prisma.destination.findUnique({ where: { id }, select: { userId: true } });
  if (!dest) throw new NotFoundError();

  if (actor.role !== "admin" && dest.userId !== actor.id) throw new ForbiddenError();

  await prisma.destination.delete({ where: { id } });
};
