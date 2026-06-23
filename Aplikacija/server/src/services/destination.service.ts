import type { AuthUser } from "../schemas/auth.schema.js";
import type {
  CreateDestinationInput,
  ListDestinationsAdminQuery,
  ListDestinationsQuery,
  UpdateDestinationInput,
} from "../schemas/destination.schema.js";

import { Prisma } from "../../generated/prisma/client.js";
import { createDestination as createDestinationSql } from "../../generated/prisma/sql/createDestination.js";
import { getDestinationById } from "../../generated/prisma/sql/getDestinationById.js";
import { getDestinations } from "../../generated/prisma/sql/getDestinations.js";
import { getRoutePoints } from "../../generated/prisma/sql/getRoutePoints.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";
import { assertOwnerOrAdmin } from "../utils/assertOwnerOrAdmin.js";
import { removeUndefined } from "../utils/removeUndefined.js";
import { reverseGeocode } from "./geocoding.service.js";
import * as mediaService from "./media.service.js";

const assertValidPointIds = async (ids: number[]) => {
  if (!ids.length) return;
  if (new Set(ids).size !== ids.length) throw new BadRequestError("Duplicate point id's");
  const found = await prisma.destination.findMany({
    where: { id: { in: ids }, type: "point" },
    select: { id: true },
  });
  if (found.length !== ids.length) throw new BadRequestError("Invalid point ids");
};

const adminOrderBy = (
  sort: ListDestinationsAdminQuery["sort"],
  order: ListDestinationsAdminQuery["order"],
): Prisma.DestinationOrderByWithRelationInput => {
  switch (sort) {
    case "reports":
      return { reports: { _count: order } };
    case "reviews":
      return { reviews: { _count: order } };
    default:
      return { createdAt: order };
  }
};

export const findAllAdmin = async (query: ListDestinationsAdminQuery) => {
  const { type, category, q, sort, order, limit } = query;

  return await prisma.destination.findMany({
    where: {
      ...(type && { type }),
      ...(category && { categoryId: category }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
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
    orderBy: adminOrderBy(sort, order),
    take: limit,
  });
};

export const findMany = async (query: ListDestinationsQuery) => {
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

export const findByUser = async (userId: number) => {
  return await prisma.destination.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      city: true,
      country: true,
      createdAt: true,
      category: { select: { id: true, name: true, icon: true } },
      media: {
        orderBy: { position: "asc" },
        take: 1,
        select: { id: true, url: true, type: true, position: true },
      },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findById = async (id: number) => {
  const [dest] = await prisma.$queryRawTyped(getDestinationById(id));
  if (!dest) throw new NotFoundError();

  const media = await mediaService.findByDestinationId(id);
  const points = dest.type === "route" ? await prisma.$queryRawTyped(getRoutePoints(dest.id)) : [];

  return { ...dest, media, points };
};

export const createDestination = async (
  userId: number,
  data: CreateDestinationInput,
  files: Express.Multer.File[],
) => {
  const { title, description, type, geometry, categoryId } = data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new BadRequestError("Invalid categoryId");

  const coords = data.type === "point" ? data.geometry.coordinates : data.geometry.coordinates[0];
  if (!coords) throw new BadRequestError("Invalid geometry");
  const [lng, lat] = coords;

  const { city, country } = await reverseGeocode(lng, lat);

  if (data.type === "route" && data.points?.length) await assertValidPointIds(data.points);

  const uploaded = await mediaService.uploadFiles(files);

  try {
    return await prisma.$transaction(async (tx) => {
      const [dest] = await tx.$queryRawTyped(
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
      if (!dest) throw new Error("Failed to create destination");

      if (data.type === "route" && data.points?.length) {
        await tx.routePoint.createMany({
          data: data.points.map((pointId) => ({ routeId: dest.id, pointId })),
        });
      }

      const media = uploaded.length
        ? await tx.media.createManyAndReturn({
            data: uploaded.map((m, i) => ({ ...m, position: i, destinationId: dest.id })),
            select: { id: true, url: true, type: true, position: true },
          })
        : [];

      return { ...dest, media };
    });
  } catch (err) {
    await mediaService.destroyUploaded(uploaded);
    throw err;
  }
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

export const addRoutePoint = async (routeId: number, actor: AuthUser, pointId: number) => {
  const route = await prisma.destination.findUnique({
    where: { id: routeId },
    select: { userId: true, type: true },
  });
  if (!route) throw new NotFoundError();
  assertOwnerOrAdmin(actor, route.userId);
  if (route.type !== "route") throw new BadRequestError("Only routes have points");

  const point = await prisma.destination.findUnique({
    where: { id: pointId },
    select: { type: true },
  });
  if (point?.type !== "point") throw new BadRequestError("Invalid point id");

  // skipDuplicates makes re-adding an already-linked point a harmless no-op (PK guards it)
  await prisma.routePoint.createMany({ data: [{ routeId, pointId }], skipDuplicates: true });

  return findById(routeId);
};

export const removeRoutePoint = async (routeId: number, actor: AuthUser, pointId: number) => {
  const route = await prisma.destination.findUnique({
    where: { id: routeId },
    select: { userId: true },
  });
  if (!route) throw new NotFoundError();
  assertOwnerOrAdmin(actor, route.userId);

  // deleteMany so removing a link that isn't there is a no-op rather than an error
  await prisma.routePoint.deleteMany({ where: { routeId, pointId } });

  return findById(routeId);
};
