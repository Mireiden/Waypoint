import { z } from "zod";

// const userSchema = z.object({
//   id: z.number(),
//   name: z.string(),
//   email: z.email(),
//   passwordHash: z.string(),
//   avatarUrl: z.url().nullable(),
//   role: z.enum(["user", "admin"]).default("user"),
//   createdAt: z.date(),
// });

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(255),
  avatarUrl: z.url(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
