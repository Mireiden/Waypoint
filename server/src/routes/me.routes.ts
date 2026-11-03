import { Router } from "express";

import * as favoriteController from "../controllers/favorite.controller.js";
import * as userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router: Router = Router();

router.get("/", authMiddleware, userController.getMe);
router.patch("/", authMiddleware, userController.updateMe);
router.delete("/", authMiddleware, userController.deleteMe);
router.patch("/password", authMiddleware, userController.changePassword);
router.put("/avatar", authMiddleware, upload.single("avatar"), userController.uploadAvatar);
router.delete("/avatar", authMiddleware, userController.deleteAvatar);
router.get("/favorites", authMiddleware, favoriteController.getByUserId);
router.post("/favorites/:destId", authMiddleware, favoriteController.addFavorite);
router.delete("/favorites/:destId", authMiddleware, favoriteController.removeFavorite);

export default router;
