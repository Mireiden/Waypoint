import type { Request, Response } from "express";

import * as favoriteService from "../services/favorite.service.js";
import { assertAuth } from "../utils/assertAuth.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export const getByUserId = async (req: Request, res: Response) => {
  assertAuth(req);
  const favorites = await favoriteService.findByUserId(req.user.id);
  res.json(favorites);
};

export const addFavorite = async (req: Request, res: Response) => {
  assertAuth(req);

  const destId = parseIdParam(req.params.destId);
  const favorite = await favoriteService.add(req.user.id, destId);
  res.status(201).json(favorite);
};

export const removeFavorite = async (req: Request, res: Response) => {
  assertAuth(req);

  const destId = parseIdParam(req.params.destId, "destination id");
  await favoriteService.remove(req.user.id, destId);
  res.status(204).send();
};
