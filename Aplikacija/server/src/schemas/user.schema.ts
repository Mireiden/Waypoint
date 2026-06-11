import { z } from "zod";

export const updateProfileSchema = z.object({
  avatarUrl: z.url().nullable().optional(),
  name: z.string().min(1).max(255).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
