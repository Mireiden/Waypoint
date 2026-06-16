import { type Request, type Response } from "express";
import { treeifyError } from "zod";

import { ValidationError } from "../errors/validationError.js";
import { createDestinationSchema, updateDestinationSchema } from "../schemas/destination.schema.js";
import * as destinationService from "../services/destination.service.js";
import { assertAuth } from "../utils/assertAuth.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export const getDestinations = async (_req: Request, res: Response) => {
  const destinations = await destinationService.findAll();
  res.json(destinations);
};

export const getAdminDestinations = async (_req: Request, res: Response) => {
  const destinations = await destinationService.findAllAdmin();
  res.json(destinations);
};

export const getReviews = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "destination id");
  const reviews = await destinationService.findReviews(id);
  res.json(reviews);
};

export const getById = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const dest = await destinationService.findById(id);
  res.json(dest);
};

export const createDestination = async (req: Request, res: Response) => {
  assertAuth(req);

  const parsed = createDestinationSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const dest = await destinationService.createDestination(req.user.id, parsed.data);

  res.json(dest);
};

export const updateDestination = async (req: Request, res: Response) => {
  assertAuth(req);

  const id = parseIdParam(req.params.id, "destination id");

  const parsed = updateDestinationSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const updated = await destinationService.updateDestination(id, req.user, parsed.data);

  res.json(updated);
};

export const deleteDestination = async (req: Request, res: Response) => {
  assertAuth(req);
  const id = parseIdParam(req.params.id, "destination id");

  await destinationService.deleteDestination(id, req.user);

  res.status(204).send();
};
