import express from "express";
import * as userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/user", userController.getAllUsers);
router.get("/user/:id", userController.getUserById);
router.put("/user/:id", userController.updateUser);
router.delete("/user/:id", userController.deleteUser);

export default router;
