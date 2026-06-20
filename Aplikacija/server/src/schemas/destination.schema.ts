import { z } from "zod";

import { lineStringGeometrySchema, pointGeometrySchema } from "./geometry.schema.js";

// multipart/form-data sends nested fields as JSON strings - parse before validating
// JSON bodies pass through unchanged (value is already an object)
const jsonString = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v) as unknown;
    } catch {
      return v; // leave invalid string for the schema to reject
    }
  }, schema);

const baseFields = {
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  categoryId: z.coerce.number().int().positive(),
};

export const createPointSchema = z.object({
  type: z.literal("point"),
  geometry: jsonString(pointGeometrySchema),
  ...baseFields,
});

export const createRouteSchema = z.object({
  type: z.literal("route"),
  geometry: jsonString(lineStringGeometrySchema),
  ...baseFields,
});

export const createDestinationSchema = z.discriminatedUnion("type", [
  createPointSchema,
  createRouteSchema,
]);

export const updateDestinationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
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

export const listDestinationsQuerySchema = z.object({
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
export type ListDestinationsQuery = z.infer<typeof listDestinationsQuerySchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;
