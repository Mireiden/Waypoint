import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const router: Router = Router();

router.use("/users", authMiddleware, userRoutes);
router.use("/auth", authRoutes);

export default router;
