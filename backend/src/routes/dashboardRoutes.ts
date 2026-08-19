import {
  Router,
} from "express";

import {
  getDashboardSummary,
} from "../controllers/dashboardController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const router =
  Router();

/* =========================================================
   GET DASHBOARD SUMMARY
========================================================= */

router.get(
  "/summary",
  authMiddleware,
  getDashboardSummary
);

export default router;