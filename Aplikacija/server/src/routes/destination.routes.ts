import { Router } from "express";

import config from "../config/config.js";
import * as destinationController from "../controllers/destination.controller.js";
import * as mediaController from "../controllers/media.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router: Router = Router();

router.post("/", authMiddleware, destinationController.createDestination);
router.get("/:id", destinationController.getById);
router.patch("/:id", authMiddleware, destinationController.updateDestination);
router.delete("/:id", authMiddleware, destinationController.deleteDestination);
router.post(
  "/:id/media",
  authMiddleware,
  upload.array("files", config.upload.maxFiles),
  mediaController.uploadDestinationMedia,
);
router.delete("/:id/media", authMiddleware, mediaController.deleteDestinationMedia);

export default router;
