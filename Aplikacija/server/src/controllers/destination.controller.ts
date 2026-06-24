import { type Request, type Response } from "express";
import { treeifyError } from "zod";

import { ValidationError } from "../errors/validationError.js";
import {
  addRoutePointSchema,
  createDestinationSchema,
  listDestinationsAdminQuerySchema,
  listDestinationsQuerySchema,
  updateDestinationSchema,
} from "../schemas/destination.schema.js";
import * as destinationService from "../services/destination.service.js";
import { assertAuth } from "../utils/assertAuth.js";
import { getFiles } from "../utils/files.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export const getDestinations = async (req: Request, res: Response) => {
  const parsed = listDestinationsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const destinations = await destinationService.findMany(parsed.data);
  res.json(destinations);
};

export const getAdminDestinations = async (req: Request, res: Response) => {
  const parsed = listDestinationsAdminQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const destinations = await destinationService.findAllAdmin(parsed.data);
  res.json(destinations);
};

export const getMyDestinations = async (req: Request, res: Response) => {
  assertAuth(req);
  const destinations = await destinationService.findByUser(req.user.id);
  res.json(destinations);
};

// Public: the destinations created by a given user (for their profile page).
// Reuses the same query as getMyDestinations, just keyed by the URL id.
export const getUserDestinations = async (req: Request, res: Response) => {
  const userId = parseIdParam(req.params.id, "user id");
  const destinations = await destinationService.findByUser(userId);
  res.json(destinations);
};

export const getById = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const dest = await destinationService.findById(id, req.user?.id);
  res.json(dest);
};

export const createDestination = async (req: Request, res: Response) => {
  assertAuth(req);

  const parsed = createDestinationSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const files = getFiles(req);
  const dest = await destinationService.createDestination(req.user.id, parsed.data, files);

  res.status(201).json(dest);
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

export const addRoutePoint = async (req: Request, res: Response) => {
  assertAuth(req);
  const id = parseIdParam(req.params.id, "route id");

  const parsed = addRoutePointSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const route = await destinationService.addRoutePoint(id, req.user, parsed.data.pointId);

  res.status(201).json(route);
};

export const removeRoutePoint = async (req: Request, res: Response) => {
  assertAuth(req);
  const id = parseIdParam(req.params.id, "route id");
  const pointId = parseIdParam(req.params.pointId, "point id");

  const route = await destinationService.removeRoutePoint(id, req.user, pointId);

  res.json(route);
};
