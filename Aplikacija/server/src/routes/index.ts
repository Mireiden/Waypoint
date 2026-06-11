import { Router } from "express";

import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import meRoutes from "./me.routes.js";
import userRoutes from "./user.routes.js";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/me", meRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);

export default router;
