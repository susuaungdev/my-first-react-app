import { Router } from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const router = Router();

/* =========================================================
   GET ALL NOTIFICATIONS
========================================================= */

router.get(
  "/",
  authMiddleware,
  getNotifications
);

/* =========================================================
   GET UNREAD COUNT
========================================================= */

router.get(
  "/unread-count",
  authMiddleware,
  getUnreadNotificationCount
);

/* =========================================================
   MARK ALL AS READ
========================================================= */

router.put(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsRead
);

/* =========================================================
   MARK ONE AS READ
========================================================= */

router.put(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

export default router;