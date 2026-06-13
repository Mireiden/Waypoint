import { Router } from "express";

import * as destinationController from "../controllers/destination.controller.js";

const router: Router = Router();

router.get("/:id", destinationController.getById);

export default router;
