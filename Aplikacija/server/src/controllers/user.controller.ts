import { type Request, type Response } from "express";
import { treeifyError } from "zod";

import { assertAuth } from "../middlewares/auth.middleware.js";
import { updateProfileSchema } from "../schemas/user.schema.js";
import * as userService from "../services/user.service.js";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.findAll();
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const users = await userService.findById(id);
  res.json(users);
};

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: treeifyError(parsed.error) });
    return;
  }
  const updated = await userService.updateProfile(id, parsed.data);
  res.json(updated);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

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
  if (!parsed.success) {
    res.status(400).json({ error: treeifyError(parsed.error) });
    return;
  }
  const updated = await userService.updateProfile(req.user.id, parsed.data);
  res.json(updated);
};

export const deleteMe = async (req: Request, res: Response) => {
  assertAuth(req);
  await userService.deleteUser(req.user.id);
  res.clearCookie("jwt").status(204).send();
};
