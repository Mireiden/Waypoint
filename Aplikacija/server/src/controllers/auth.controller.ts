import { treeifyError } from "zod";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import * as authService from "../services/auth.service.js";
import type { Request, Response } from "express";

export const login = async (req: Request, res: Response) => {
  const loginInfo = await loginSchema.safeParseAsync(req.body);
  if (!loginInfo.success) {
    res.status(400).send({ error: treeifyError(loginInfo.error) });
    return;
  }

  const { safeUser, token } = await authService.login(loginInfo.data);
  res.json({ safeUser, token });
};

export const register = async (req: Request, res: Response) => {
  const registerInfo = await registerSchema.safeParseAsync(req.body);
  if (!registerInfo.success) {
    res.status(400).send({ error: treeifyError(registerInfo.error) });
    return;
  }

  const { user, token } = await authService.register(registerInfo.data);
  res.json({ user, token });
};
