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

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type CreatePointInput = z.infer<typeof createPointSchema>;
export type CreateRouteInput = z.infer<typeof createRouteSchema>;
