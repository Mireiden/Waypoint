import { z } from "zod";

import { Role } from "../../generated/prisma/enums.js";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,64}$/; //at least one number, at least one letter, 8-64 in length

export const authUserSchema = z.object({
  id: z.number().int().positive(),
  role: z.enum(Role),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  name: z.string().min(1).max(255),
  password: z
    .string()
    .min(8)
    .max(64)
    .regex(passwordRegex, "Password must contain a letter and a number."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8)
    .max(64)
    .regex(passwordRegex, "Password must contain a letter and a number."),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
