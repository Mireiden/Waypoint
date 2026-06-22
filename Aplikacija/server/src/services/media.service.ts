import type { MediaType } from "../../generated/prisma/enums.js";
import type { AuthUser } from "../schemas/auth.schema.js";

import config from "../config/config.js";
import { BadRequestError } from "../errors/badRequestError.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { prisma } from "../lib/prisma.js";
import * as cloudinaryService from "../services/cloudinary.service.js";
import { assertOwnerOrAdmin } from "../utils/assertOwnerOrAdmin.js";

// mimetype is already filtered to image/ or video/ in the upload middleware
const resolveMediaType = (mimetype: string): MediaType =>
  mimetype.startsWith("video/") ? "video" : "image";

// pure cloudinary upload - returns media to persist
export const uploadFiles = async (files: Express.Multer.File[]) => {
  return await Promise.all(
    files.map(async (file) => {
      const type = resolveMediaType(file.mimetype);
      const { url, publicId } = await cloudinaryService.uploadBuffer(file.buffer, type);
      return { url, publicId, type };
    }),
  );
};

export const destroyUploaded = async (uploaded: { publicId: string; type: MediaType }[]) => {
  await Promise.all(uploaded.map((m) => cloudinaryService.destroy(m.publicId, m.type)));
};

const attachMedia = async (
  where: { destinationId: number } | { reviewId: number },
  max: number,
  files: Express.Multer.File[],
) => {
  const agg = await prisma.media.aggregate({
    where,
    _count: true,
    _max: { position: true },
  });
  const start = (agg._max.position ?? -1) + 1;

  if (agg._count + files.length > max) {
    throw new BadRequestError(`Can have at most ${String(max)} media`);
  }

  const uploaded = await uploadFiles(files);
  const data = uploaded.map((m, i) => ({ ...m, position: start + i, ...where }));

  try {
    return await prisma.media.createManyAndReturn({
      data,
      select: { id: true, url: true, type: true, position: true },
    });
  } catch (err) {
    // clean up orphaned cloudinary uploads if db persist fails
    await destroyUploaded(uploaded);
    throw err;
  }
};

export const addToDestination = async (
  destId: number,
  actor: AuthUser,
  files: Express.Multer.File[],
) => {
  const dest = await prisma.destination.findUnique({
    where: { id: destId },
    select: { userId: true },
  });
  if (!dest) throw new NotFoundError("Invalid destination ID");
  assertOwnerOrAdmin(actor, dest.userId);
  return attachMedia({ destinationId: destId }, config.upload.maxMediaPerDestination, files);
};

export const addToReview = async (
  reviewId: number,
  actor: AuthUser,
  files: Express.Multer.File[],
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  });
  if (!review) throw new NotFoundError("Invalid review ID");
  assertOwnerOrAdmin(actor, review.userId);
  return attachMedia({ reviewId }, config.upload.maxMediaPerReview, files);
};

export const deleteMedia = async (id: number, actor: AuthUser) => {
  const media = await prisma.media.findUnique({
    where: { id },
    select: {
      publicId: true,
      type: true,
      destination: { select: { userId: true } },
      review: { select: { userId: true } },
    },
  });
  if (!media) throw new NotFoundError();

  const ownerId = media.destination?.userId ?? media.review?.userId;
  assertOwnerOrAdmin(actor, ownerId);

  await prisma.media.delete({ where: { id } });
  await cloudinaryService.destroy(media.publicId, media.type);
};

export const deleteAllFromDestination = async (destId: number, actor: AuthUser) => {
  const dest = await prisma.destination.findUnique({
    where: { id: destId },
    select: { userId: true },
  });
  if (!dest) throw new NotFoundError();
  assertOwnerOrAdmin(actor, dest.userId);
  const media = await prisma.media.findMany({
    where: { destinationId: destId },
    select: {
      publicId: true,
      type: true,
    },
  });

  await prisma.media.deleteMany({ where: { destinationId: destId } });
  await destroyUploaded(media);
};

export const findByDestinationId = async (destId: number) => {
  return await prisma.media.findMany({
    where: { destinationId: destId },
    select: {
      id: true,
      url: true,
      type: true,
      position: true,
    },
    orderBy: { position: "asc" },
  });
};
