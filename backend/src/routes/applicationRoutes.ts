import { Router } from "express";

import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createApplication
);

router.get(
  "/",
  authMiddleware,
  getApplications
);

router.get(
  "/:id",
  authMiddleware,
  getApplicationById
);

router.put(
  "/:id",
  authMiddleware,
  updateApplication
);

router.delete(
  "/:id",
  authMiddleware,
  deleteApplication
);

export default router;