import type { CreateReviewInput, ListReviewsQuery } from "../schemas/review.schema.js";

import { Prisma } from "../../generated/prisma/client.js";
import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";
import { removeUndefined } from "../utils/removeUndefined.js";
import * as mediaService from "./media.service.js";

const reviewOrderBy: Record<ListReviewsQuery["sort"], Prisma.ReviewOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  highest: { rating: "desc" },
  lowest: { rating: "asc" },
};

export const findById = async (id: number) => {
  const review = await prisma.review.findUnique({ where: { id } });
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
      user: { select: { id: true, name: true } },
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
        user: { select: { id: true, name: true } },
        media: { select: { id: true, url: true, type: true, position: true } },
      },
    });
  } catch (err) {
    await mediaService.destroyUploaded(uploaded);
    throw err;
  }
};
