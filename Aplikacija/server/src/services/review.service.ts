import type { AuthUser } from "../schemas/auth.schema.js";
import type {
  CreateReviewInput,
  ListReviewsQuery,
  UpdateReviewInput,
} from "../schemas/review.schema.js";

import { Prisma } from "../../generated/prisma/client.js";
import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";
import { assertOwnerOrAdmin } from "../utils/assertOwnerOrAdmin.js";
import { removeUndefined } from "../utils/removeUndefined.js";
import * as mediaService from "./media.service.js";

const reviewOrderBy: Record<ListReviewsQuery["sort"], Prisma.ReviewOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  highest: { rating: "desc" },
  lowest: { rating: "asc" },
};

export const findById = async (id: number) => {
  const review = await prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      media: { select: { id: true, url: true, type: true } },
      destination: { select: { id: true, title: true } },
    },
  });
  if (!review) throw new NotFoundError();
  return review;
};

export const findByDestinationId = async (destId: number, query: ListReviewsQuery) => {
  const { sort, limit, offset } = query;

  return await prisma.review.findMany({
    where: { destinationId: destId },
    orderBy: reviewOrderBy[sort],
    take: limit,
    skip: offset,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      media: { select: { id: true, url: true, type: true } },
    },
  });
};

export const createReview = async (
  destinationId: number,
  userId: number,
  data: CreateReviewInput,
  files: Express.Multer.File[],
) => {
  const dest = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { id: true },
  });
  if (!dest) throw new NotFoundError("Invalid destination ID");

  const uploaded = await mediaService.uploadFiles(files);

  try {
    return await prisma.review.create({
      data: {
        destinationId,
        userId,
        ...removeUndefined(data),
        media: {
          create: uploaded.map((m, i) => ({ ...m, position: i })),
        },
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
        media: { select: { id: true, url: true, type: true, position: true } },
      },
    });
  } catch (err) {
    await mediaService.destroyUploaded(uploaded);
    throw err;
  }
};

export const updateReview = async (id: number, actor: AuthUser, data: UpdateReviewInput) => {
  const review = await prisma.review.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!review) throw new NotFoundError();
  assertOwnerOrAdmin(actor, review.userId);

  return await prisma.review.update({
    where: { id },
    data: removeUndefined(data),
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      media: { select: { id: true, url: true, type: true, position: true } },
    },
  });
};

export const deleteReview = async (id: number, actor: AuthUser) => {
  const review = await prisma.review.findUnique({
    where: { id },
    select: { userId: true, media: { select: { publicId: true, type: true } } },
  });
  if (!review) throw new NotFoundError();
  assertOwnerOrAdmin(actor, review.userId);

  await prisma.review.delete({ where: { id } });
  await mediaService.destroyUploaded(review.media);
};
