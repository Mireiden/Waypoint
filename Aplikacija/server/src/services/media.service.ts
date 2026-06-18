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

  const agg = await prisma.media.aggregate({
    where: { destinationId: destId },
    _count: true,
    _max: { position: true },
  });
  const existingCount = agg._count;
  const start = (agg._max.position ?? -1) + 1;

  if (existingCount + files.length > config.upload.maxMediaPerDestination) {
    throw new BadRequestError(
      `A destination can have at most ${String(config.upload.maxMediaPerDestination)} media`,
    );
  }

  const uploaded = await uploadFiles(files);
  const data = uploaded.map((m, i) => ({ ...m, position: start + i, destinationId: destId }));

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

  await cloudinaryService.destroy(media.publicId, media.type);
  await prisma.media.delete({ where: { id } });
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

  await destroyUploaded(media);
  await prisma.media.deleteMany({ where: { destinationId: destId } });
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
