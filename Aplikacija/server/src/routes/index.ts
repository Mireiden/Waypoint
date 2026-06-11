import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import authRoutes from "./auth.routes.js";
import meRoutes from "./me.routes.js";
import userRoutes from "./user.routes.js";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/me", authMiddleware, meRoutes);
router.use("/users", userRoutes);

export default router;
