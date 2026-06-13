import { z } from "zod";

export const nominatimResultSchema = z.object({
  address: z
    .object({
      city: z.string().optional(),
      town: z.string().optional(),
      village: z.string().optional(),
      municipality: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

export type NominatimResult = z.infer<typeof nominatimResultSchema>;
