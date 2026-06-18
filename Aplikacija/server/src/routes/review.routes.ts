import { Router } from "express";

import * as reviewsController from "../controllers/review.controller.js";
// import authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/:id", reviewsController.getById);
// router.patch("/:id", authMiddleware, reviewsController.updateReview);
// router.delete("/:id", authMiddleware, reviewsController.deleteReview);

export default router;
