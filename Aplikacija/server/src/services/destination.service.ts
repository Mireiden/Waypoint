import type { AuthUser } from "../schemas/auth.schema.js";
import type {
  CreateDestinationInput,
  FindManyQuery,
  UpdateDestinationInput,
} from "../schemas/destination.schema.js";

import { createDestination as createDestinationSql } from "../../generated/prisma/sql/createDestination.js";
import { getDestinationById } from "../../generated/prisma/sql/getDestinationById.js";
import { getDestinations } from "../../generated/prisma/sql/getDestinations.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";
import { assertOwnerOrAdmin } from "../utils/assertOwnerOrAdmin.js";
import { removeUndefined } from "../utils/removeUndefined.js";
import { reverseGeocode } from "./geocoding.service.js";
import * as mediaService from "./media.service.js";

export const findReviews = async (id: number) => {
  return await prisma.review.findMany({
    where: { destinationId: id },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
      media: { select: { id: true, url: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findAllAdmin = async () => {
  return await prisma.destination.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      city: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      _count: { select: { reviews: true, reports: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findMany = async (query: FindManyQuery) => {
  const { type, sort, limit, category, q, bbox } = query;

  return await prisma.$queryRawTyped(
    getDestinations(
      type ?? null,
      category ?? null,
      q ?? null,
      bbox?.minLng ?? null,
      bbox?.minLat ?? null,
      bbox?.maxLng ?? null,
      bbox?.maxLat ?? null,
      sort,
      limit,
    ),
  );
};

export const findById = async (id: number) => {
  const [dest] = await prisma.$queryRawTyped(getDestinationById(id));
  if (!dest) throw new NotFoundError();
  const [media, reviews] = await Promise.all([
    mediaService.findByDestinationId(id),
    findReviews(id),
  ]);
  return { ...dest, media, reviews };
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

export const updateDestination = async (
  id: number,
  actor: AuthUser,
  data: UpdateDestinationInput,
) => {
  const dest = await prisma.destination.findUnique({ where: { id }, select: { userId: true } });
  if (!dest) throw new NotFoundError();
  assertOwnerOrAdmin(actor, dest.userId);

  if (data.categoryId !== undefined) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new BadRequestError("Invalid categoryId");
  }

  await prisma.destination.update({ where: { id }, data: removeUndefined(data) });
  return findById(id);
};

export const deleteDestination = async (id: number, actor: AuthUser) => {
  const dest = await prisma.destination.findUnique({ where: { id }, select: { userId: true } });
  if (!dest) throw new NotFoundError();

  assertOwnerOrAdmin(actor, dest.userId);

  await prisma.destination.delete({ where: { id } });
};
