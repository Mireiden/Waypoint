import { Router } from "express";

import * as mediaController from "../controllers/media.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.delete("/:id", authMiddleware, mediaController.deleteMedia);

export default router;
