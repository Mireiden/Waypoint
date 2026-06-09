import { z } from "zod";

export const updateProfileSchema = z.object({
  avatarUrl: z.url().optional(),
  name: z.string().min(2).max(255).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
