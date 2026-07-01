import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router: Router = Router();

router.post("/login", authLimiter, authController.login);
router.post("/register", authLimiter, authController.register);
router.post("/logout", authController.logout);

export default router;
