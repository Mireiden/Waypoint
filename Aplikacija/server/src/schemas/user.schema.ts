import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(255),
  avatarUrl: z.url(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
