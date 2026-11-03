import { z } from "zod";

import { ReportReason } from "../../generated/prisma/enums.js";
import { ReportStatus } from "../../generated/prisma/enums.js";

export const listReportsQuerySchema = z.object({
  status: z.enum(ReportStatus).default("pending"),
  targetType: z.enum(["destination", "user", "review"]).optional(),
  sort: z.enum(["newest", "oldest", "mostReports"]).default("mostReports"),
});

export const createReportSchema = z.object({
  reason: z.enum(ReportReason),
  note: z.string().optional(),
  targetType: z.enum(["destination", "user", "review"]),
  targetId: z.coerce.number().int().positive(),
});

export const setReportsStatusSchema = z.object({
  status: z.enum(["dismissed", "resolved"]),
});

export const targetTypeSchema = z.enum(["destination", "review", "user"]);

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;
export type SetReportsStatusInput = z.infer<typeof setReportsStatusSchema>;
