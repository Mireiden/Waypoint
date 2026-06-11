import { Router } from "express";

import * as userController from "../controllers/user.controller.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/", authMiddleware, adminMiddleware, userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id", authMiddleware, adminMiddleware, userController.updateUser);
router.delete("/:id", authMiddleware, adminMiddleware, userController.deleteUser);

export default router;
