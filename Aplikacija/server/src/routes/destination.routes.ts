import { Router } from "express";

import * as destinationController from "../controllers/destination.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/:id", destinationController.getById);
router.post("/", authMiddleware, destinationController.createDestination);

export default router;
