import bcrypt from "bcrypt";

import type { UpdateProfileInput } from "../schemas/user.schema.js";

import { BadRequestError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/prisma.js";
import { type ChangePasswordInput } from "../schemas/auth.schema.js";
import { removeUndefined } from "../utils/removeUndefined.js";
import * as cloudinaryService from "./cloudinary.service.js";

export const findAll = async () => {
  return prisma.user.findMany({
    omit: {
      passwordHash: true,
    },
    include: {
      _count: { select: { destinations: true, reviews: true, reportsAgainst: true } },
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

export const changePassword = async (id: number, data: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { passwordHash: true },
  });
  if (!user) throw new NotFoundError("User not found");

  const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!isValid) throw new BadRequestError("Current password is incorrect.");

  const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: {
      passwordHash: newPasswordHash,
    },
  });
};

export const uploadAvatar = async (userId: number, file: Express.Multer.File) => {
  if (!file.mimetype.startsWith("image/")) throw new BadRequestError("Wrong file type");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });
  if (!user) throw new NotFoundError("User not found");

  const uploaded = await cloudinaryService.uploadBuffer(file.buffer, "image");

  const updated = await prisma.user
    .update({
      where: { id: userId },
      data: {
        avatarUrl: uploaded.url,
        avatarPublicId: uploaded.publicId,
      },
      select: {
        id: true,
        avatarUrl: true,
      },
    })
    .catch(async (err: unknown) => {
      await cloudinaryService.destroy(uploaded.publicId, "image");
      throw err;
    });

  if (user.avatarPublicId) await cloudinaryService.destroy(user.avatarPublicId, "image");

  return updated;
};

export const deleteAvatar = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });
  if (!user) throw new NotFoundError("User not found");
  if (!user.avatarPublicId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null, avatarPublicId: null },
  });
  await cloudinaryService.destroy(user.avatarPublicId, "image");
};

export const deleteUser = async (id: number) => {
  await prisma.user.delete({
    where: { id },
  });
};

export const deleteAccount = async (id: number, currentPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: { passwordHash: true } });
  if (!user) throw new NotFoundError("User not found");
  const correct = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!correct) throw new BadRequestError("Wrong password.");

  await prisma.user.delete({ where: { id } });
};
