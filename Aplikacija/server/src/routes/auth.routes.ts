import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router: Router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);

export default router;
