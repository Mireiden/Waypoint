import { Router } from "express";

import config from "../config/config.js";
import * as mediaController from "../controllers/media.controller.js";
import * as reviewController from "../controllers/review.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router: Router = Router();

router.get("/:id", reviewController.getById);
router.patch("/:id", authMiddleware, reviewController.updateReview);
router.delete("/:id", authMiddleware, reviewController.deleteReview);
router.post(
  "/:id/media",
  authMiddleware,
  upload.array("files", config.upload.maxFiles),
  mediaController.uploadReviewMedia,
);

export default router;
