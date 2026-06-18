import type { Request, Response } from "express";

import * as mediaService from "../services/media.service.js";
import { assertAuth } from "../utils/assertAuth.js";
import { requireFiles } from "../utils/files.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export const uploadDestinationMedia = async (req: Request, res: Response) => {
  assertAuth(req);
  const id = parseIdParam(req.params.id, "destination id");
  const files = requireFiles(req);

  const media = await mediaService.addToDestination(id, req.user, files);
  res.status(201).json(media);
};

export const deleteMedia = async (req: Request, res: Response) => {
  assertAuth(req);
  const id = parseIdParam(req.params.id, "media id");

  await mediaService.deleteMedia(id, req.user);
  res.status(204).send();
};

export const deleteDestinationMedia = async (req: Request, res: Response) => {
  assertAuth(req);
  const id = parseIdParam(req.params.id, "destination id");

  await mediaService.deleteAllFromDestination(id, req.user);
  res.status(204).send();
};
