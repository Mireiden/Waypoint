import { Router } from "express";

import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import destinationRoutes from "./destination.routes.js";
import meRoutes from "./me.routes.js";
import userRoutes from "./user.routes.js";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/me", meRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/destinations", destinationRoutes);

export default router;
