import { Router } from "express";

import {
  getAnalyticsOverview,
} from "../controllers/analyticsController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const router = Router();

/* =========================================================
   GET ANALYTICS OVERVIEW
========================================================= */

router.get(
  "/overview",
  authMiddleware,
  getAnalyticsOverview
);

export default router;