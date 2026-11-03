import { Router } from "express";

import * as categoryController from "../controllers/category.controller.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/", authMiddleware, adminMiddleware, categoryController.createCategory);
router.patch("/:id", authMiddleware, adminMiddleware, categoryController.updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, categoryController.deleteCategory);

export default router;
