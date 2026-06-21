import { Router } from "express";

import * as reportController from "../controllers/report.controller.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/", authMiddleware, adminMiddleware, reportController.getReportedTargets);
router.post("/", authMiddleware, reportController.createReport);
router.get("/:type/:id", authMiddleware, adminMiddleware, reportController.getReportsForTarget);

export default router;
