import type { Request, Response } from "express";

import { treeifyError } from "zod";

import { ValidationError } from "../errors/validationError.js";
import {
  createReportSchema,
  listReportsQuerySchema,
  targetTypeSchema,
} from "../schemas/report.schema.js";
import * as reportService from "../services/report.service.js";
import { assertAuth } from "../utils/assertAuth.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export const getReportedTargets = async (req: Request, res: Response) => {
  const parsed = listReportsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const targets = await reportService.findReportedTargets(parsed.data);
  res.json(targets);
};

export const getReportsForTarget = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);

  const parsed = targetTypeSchema.safeParse(req.params.type);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const reports = await reportService.findReportsForTarget(id, parsed.data);
  res.json(reports);
};

export const createReport = async (req: Request, res: Response) => {
  assertAuth(req);

  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const report = await reportService.createReport(req.user.id, parsed.data);
  res.status(201).json(report);
};
