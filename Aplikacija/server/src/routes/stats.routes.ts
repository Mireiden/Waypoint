import { Router } from "express";

import * as statsController from "../controllers/stats.controller.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/", authMiddleware, adminMiddleware, statsController.getStats);

export default router;
