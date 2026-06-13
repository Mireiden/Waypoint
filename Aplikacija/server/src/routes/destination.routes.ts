import { Router } from "express";

import * as destinationController from "../controllers/destination.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post("/", authMiddleware, destinationController.createDestination);
router.get("/:id", destinationController.getById);
router.delete("/:id", authMiddleware, destinationController.deleteDestination);

export default router;
