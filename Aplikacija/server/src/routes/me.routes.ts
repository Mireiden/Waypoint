import { Router } from "express";

import * as userController from "../controllers/user.controller.js";

const router: Router = Router();

router.get("/", userController.getMe);
router.patch("/", userController.updateMe);
router.delete("/", userController.deleteMe);

export default router;
