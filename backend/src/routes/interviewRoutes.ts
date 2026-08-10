import { Router } from "express";

import {
  createInterview,
  getInterviews,
  getInterviewById,
  getApplicationInterviews,
  updateInterview,
  deleteInterview,
} from "../controllers/interviewController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/* =========================================================
   CREATE INTERVIEW
========================================================= */

router.post(
  "/",
  authMiddleware,
  createInterview
);

/* =========================================================
   GET ALL INTERVIEWS
========================================================= */

router.get(
  "/",
  authMiddleware,
  getInterviews
);

/* =========================================================
   GET INTERVIEWS FOR ONE APPLICATION
========================================================= */

router.get(
  "/application/:id",
  authMiddleware,
  getApplicationInterviews
);

/* =========================================================
   GET ONE INTERVIEW
========================================================= */

router.get(
  "/:id",
  authMiddleware,
  getInterviewById
);

/* =========================================================
   UPDATE INTERVIEW
========================================================= */

router.put(
  "/:id",
  authMiddleware,
  updateInterview
);

/* =========================================================
   DELETE INTERVIEW
========================================================= */

router.delete(
  "/:id",
  authMiddleware,
  deleteInterview
);

export default router;