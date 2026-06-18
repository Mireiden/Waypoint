import { z } from "zod";

import { lineStringGeometrySchema, pointGeometrySchema } from "./geometry.schema.js";

const baseFields = {
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  categoryId: z.int().positive(),
};

export const createPointSchema = z.object({
  type: z.literal("point"),
  geometry: pointGeometrySchema,
  ...baseFields,
});

export const createRouteSchema = z.object({
  type: z.literal("route"),
  geometry: lineStringGeometrySchema,
  ...baseFields,
});

export const createDestinationSchema = z.discriminatedUnion("type", [
  createPointSchema,
  createRouteSchema,
]);

export const updateDestinationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  categoryId: z.int().positive().optional(),
});

const bboxSchema = z.string().transform((val, ctx) => {
  const parts = val.split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    ctx.addIssue({ code: "custom", message: "bbox must be 'minLng,minLat,maxLng,maxLat'" });
    return z.NEVER;
  }
  const [minLng, minLat, maxLng, maxLat] = parts;
  return { maxLat, maxLng, minLat, minLng };
});

export const findManyQuerySchema = z.object({
  type: z.enum(["point", "route"]).optional(),
  category: z.coerce.number().int().positive().optional(),
  q: z.string().trim().min(1).max(100).optional(),
  bbox: bboxSchema.optional(),
  sort: z.enum(["recent", "rating", "popular"]).default("recent"),
  limit: z.coerce.number().int().positive().max(500).default(300),
});

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type CreatePointInput = z.infer<typeof createPointSchema>;
export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type FindManyQuery = z.infer<typeof findManyQuerySchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;
