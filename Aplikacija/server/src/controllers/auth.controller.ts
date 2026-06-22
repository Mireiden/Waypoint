import type { Request, Response } from "express";

import { treeifyError } from "zod";

import config from "../config/config.js";
import { ValidationError } from "../errors/validationError.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import * as authService from "../services/auth.service.js";

export const login = async (req: Request, res: Response) => {
  const loginInfo = loginSchema.safeParse(req.body);
  if (!loginInfo.success) throw new ValidationError(treeifyError(loginInfo.error));

  const { user, token } = await authService.login(loginInfo.data);
  res
    .cookie("jwt", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: config.server.env === `production`,
    })
    .status(200)
    .json({ user });
};

export const register = async (req: Request, res: Response) => {
  const registerInfo = await registerSchema.safeParseAsync(req.body);
  if (!registerInfo.success) throw new ValidationError(treeifyError(registerInfo.error));

  const { user, token } = await authService.register(registerInfo.data);
  res
    .cookie("jwt", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: config.server.env === `production`,
    })
    .status(201)
    .json({ user });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("jwt").status(200).json({ message: "Logged out successfuly." });
};
