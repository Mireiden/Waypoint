import { type Request, type Response } from "express";
import { treeifyError } from "zod";

import { BadRequestError, ValidationError } from "../errors/index.js";
import { changePasswordSchema } from "../schemas/auth.schema.js";
import { deleteAccountSchema, updateProfileSchema } from "../schemas/user.schema.js";
import * as userService from "../services/user.service.js";
import { assertAuth } from "../utils/assertAuth.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.findAll();
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "user id");
  const isAdmin = req.user?.role === "admin";

  const user = isAdmin ? await userService.findById(id) : await userService.findPublicProfile(id);

  res.json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "user id");

  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));
  const updated = await userService.updateProfile(id, parsed.data);
  res.json(updated);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "user id");

  await userService.deleteUser(id);
  res.status(204).send();
};

export const getMe = async (req: Request, res: Response) => {
  assertAuth(req);
  const user = await userService.findById(req.user.id);
  res.status(200).json(user);
};

export const updateMe = async (req: Request, res: Response) => {
  assertAuth(req);
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));
  const updated = await userService.updateProfile(req.user.id, parsed.data);
  res.json(updated);
};

export const uploadAvatar = async (req: Request, res: Response) => {
  assertAuth(req);
  if (!req.file) throw new BadRequestError("No file uploaded");

  const updated = await userService.uploadAvatar(req.user.id, req.file);
  res.json(updated);
};

export const deleteAvatar = async (req: Request, res: Response) => {
  assertAuth(req);

  await userService.deleteAvatar(req.user.id);
  res.status(204).send();
};

export const deleteMe = async (req: Request, res: Response) => {
  assertAuth(req);
  const parsed = deleteAccountSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));
  await userService.deleteAccount(req.user.id, parsed.data.currentPassword);
  res.clearCookie("jwt").status(204).send();
};

export const changePassword = async (req: Request, res: Response) => {
  assertAuth(req);
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  await userService.changePassword(req.user.id, parsed.data);

  res.status(204).send();
};
