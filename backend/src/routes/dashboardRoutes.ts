import { Router } from "express";

import {
  getDashboardSummary,
} from "../controllers/dashboardController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/summary",
  authMiddleware,
  getDashboardSummary
);

export default router;