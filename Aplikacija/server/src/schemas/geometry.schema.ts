import { z } from "zod";

const position = z.tuple([
  z.number().min(-180).max(180), // lng
  z.number().min(-90).max(90), // lat
]);

export const pointGeometrySchema = z.object({
  type: z.literal("Point"),
  coordinates: position,
});

export const lineStringGeometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(position).min(2),
});

export type LineStringGeometry = z.infer<typeof lineStringGeometrySchema>;
export type PointGeometry = z.infer<typeof pointGeometrySchema>;
