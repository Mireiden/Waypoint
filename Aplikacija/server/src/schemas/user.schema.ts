import { z } from "zod";

export const updateProfileSchema = z.object({
  avatarUrl: z.url(),
  name: z.string().min(2).max(255),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
