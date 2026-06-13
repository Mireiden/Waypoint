import { type Request, type Response } from "express";

import * as destinationService from "../services/destination.service.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export const getById = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const dest = await destinationService.findById(id);
  res.json(dest);
};
