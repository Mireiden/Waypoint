import type { Request, Response } from "express";

import * as statsService from "../services/stats.service.js";

export const getStats = async (_req: Request, res: Response) => {
  const stats = await statsService.getStats();
  res.json(stats);
};
