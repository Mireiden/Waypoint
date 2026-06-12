import { Router } from "express";

import * as userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/", authMiddleware, userController.getMe);
router.patch("/", authMiddleware, userController.updateMe);
router.delete("/", authMiddleware, userController.deleteMe);
router.patch("/password", authMiddleware, userController.changePassword);

export default router;
