import { Router } from "express";

import * as userController from "../controllers/user.controller.js";

const router: Router = Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
