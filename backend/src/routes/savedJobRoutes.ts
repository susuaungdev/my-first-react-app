import { Router } from "express";

import {
  createSavedJob,
  getSavedJobs,
  getSavedJobById,
  updateSavedJob,
  deleteSavedJob,
} from "../controllers/savedJobController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const router = Router();

/* =========================================================
   CREATE SAVED JOB
========================================================= */

router.post(
  "/",
  authMiddleware,
  createSavedJob
);

/* =========================================================
   GET ALL SAVED JOBS
========================================================= */

router.get(
  "/",
  authMiddleware,
  getSavedJobs
);

/* =========================================================
   GET ONE SAVED JOB
========================================================= */

router.get(
  "/:id",
  authMiddleware,
  getSavedJobById
);

/* =========================================================
   UPDATE SAVED JOB
========================================================= */

router.put(
  "/:id",
  authMiddleware,
  updateSavedJob
);

/* =========================================================
   DELETE SAVED JOB
========================================================= */

router.delete(
  "/:id",
  authMiddleware,
  deleteSavedJob
);

export default router;