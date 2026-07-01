import type { CookieOptions, Request, Response } from "express";

import { treeifyError } from "zod";

import config from "../config/config.js";
import { UnauthorizedError } from "../errors/unauthorizedError.js";
import { ValidationError } from "../errors/validationError.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import * as authService from "../services/auth.service.js";

const isProd = config.server.env === "production";

const cookieBase: CookieOptions = {
  httpOnly: true,
  sameSite: isProd ? "none" : "strict",
  secure: isProd,
};

// access token: sent to every /api route
const accessCookieOptions: CookieOptions = {
  ...cookieBase,
  path: "/api",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

// refresh token: only ever sent to the auth routes (refresh + logout)
const refreshCookieOptions: CookieOptions = {
  ...cookieBase,
  path: "/api/auth",
  maxAge: 1000 * 60 * 60 * 24 * config.jwt.refreshExpiresDays,
};

export const login = async (req: Request, res: Response) => {
  const loginInfo = loginSchema.safeParse(req.body);
  if (!loginInfo.success) throw new ValidationError(treeifyError(loginInfo.error));

  const { user, token, refreshToken } = await authService.login(loginInfo.data);
  res
    .cookie("jwt", token, accessCookieOptions)
    .cookie("refresh", refreshToken, refreshCookieOptions)
    .status(200)
    .json({ user });
};

export const register = async (req: Request, res: Response) => {
  const registerInfo = registerSchema.safeParse(req.body);
  if (!registerInfo.success) throw new ValidationError(treeifyError(registerInfo.error));

  const { user, token, refreshToken } = await authService.register(registerInfo.data);
  res
    .cookie("jwt", token, accessCookieOptions)
    .cookie("refresh", refreshToken, refreshCookieOptions)
    .status(201)
    .json({ user });
};

export const refresh = async (req: Request, res: Response) => {
  const rawToken = req.cookies.refresh as string | undefined;
  if (!rawToken) throw new UnauthorizedError("No refresh token provided.");

  const { user, token, refreshToken } = await authService.refresh(rawToken);
  res
    .cookie("jwt", token, accessCookieOptions)
    .cookie("refresh", refreshToken, refreshCookieOptions)
    .status(200)
    .json({ user });
};

export const logout = async (req: Request, res: Response) => {
  const rawToken = req.cookies.refresh as string | undefined;
  if (rawToken) await authService.revokeRefreshToken(rawToken);

  res
    .clearCookie("jwt", accessCookieOptions)
    .clearCookie("refresh", refreshCookieOptions)
    .status(200)
    .json({ message: "Logged out successfuly." });
};
