import {
  Router,
} from "express";

import {
  getProfile,
  saveProfile,
} from "../controllers/profileController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

import {
  uploadProfilePicture,
} from "../middleware/uploadMiddleware";

const router =
  Router();


router.get(
  "/",
  authMiddleware,
  getProfile
);


router.put(
  "/",
  authMiddleware,
  uploadProfilePicture.single(
    "profile_picture"
  ),
  saveProfile
);


export default router;