import { Router } from "express";

import {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
} from "../controllers/resumeController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const router = Router();

/* GET ALL RESUMES */
router.get(
  "/",
  authMiddleware,
  getResumes
);

/* GET ONE RESUME */
router.get(
  "/:id",
  authMiddleware,
  getResumeById
);

/* CREATE RESUME */
router.post(
  "/",
  authMiddleware,
  createResume
);

/* UPDATE RESUME */
router.put(
  "/:id",
  authMiddleware,
  updateResume
);

/* DELETE RESUME */
router.delete(
  "/:id",
  authMiddleware,
  deleteResume
);

export default router;