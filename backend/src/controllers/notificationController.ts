import {
  Request,
  Response,
} from "express";

import db from "../config/db";

import {
  generateUserNotifications,
} from "../services/notificationGenerator";

import {
  syncUserNotifications,
} from "../services/notificationSyncService";

/* =========================================================
   GET ALL NOTIFICATIONS
========================================================= */

export const getNotifications =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      /* =====================================================
         AUTH
      ===================================================== */

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      /* =====================================================
         CLEAN OLD / STALE NOTIFICATIONS
      ===================================================== */

      await syncUserNotifications(
        userId
      );

      /* =====================================================
         GENERATE NEW REMINDERS
      ===================================================== */

      await generateUserNotifications(
        userId
      );

      /* =====================================================
         FETCH NOTIFICATIONS
      ===================================================== */

      const [rows]: any =
        await db.execute(
          `
            SELECT
              id,
              type,
              title,
              message,
              related_type,
              related_id,
              is_read,
              action_url,
              created_at,
              updated_at

            FROM notifications

            WHERE user_id = ?

            ORDER BY
              created_at DESC,
              id DESC

            LIMIT 100
          `,
          [
            userId,
          ]
        );

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.status(200).json({
        message:
          "Notifications fetched successfully",

        notifications:
          rows.map(
            (
              row: any
            ) => ({
              ...row,

              is_read:
                Boolean(
                  row.is_read
                ),
            })
          ),
      });
    } catch (error) {
      console.error(
        "Get notifications error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch notifications",
      });
    }
  };

/* =========================================================
   GET UNREAD COUNT
========================================================= */

export const getUnreadNotificationCount =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      /* =====================================================
         AUTH
      ===================================================== */

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      /*
       * Keep unread count accurate even if this endpoint
       * is requested before the full notification list.
       */

      await syncUserNotifications(
        userId
      );

      await generateUserNotifications(
        userId
      );

      /* =====================================================
         COUNT
      ===================================================== */

      const [rows]: any =
        await db.execute(
          `
            SELECT
              COUNT(*) AS unread_count

            FROM notifications

            WHERE user_id = ?
            AND is_read = FALSE
          `,
          [
            userId,
          ]
        );

      return res.status(200).json({
        message:
          "Unread notification count fetched successfully",

        unreadCount:
          Number(
            rows[0]
              ?.unread_count ||
              0
          ),
      });
    } catch (error) {
      console.error(
        "Get unread notification count error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch unread notification count",
      });
    }
  };

/* =========================================================
   MARK ONE NOTIFICATION AS READ
========================================================= */

export const markNotificationAsRead =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      const notificationId =
        Number(
          req.params.id
        );

      /* =====================================================
         AUTH
      ===================================================== */

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      /* =====================================================
         VALIDATE ID
      ===================================================== */

      if (
        !Number.isInteger(
          notificationId
        ) ||
        notificationId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid notification ID",
        });
      }

      /* =====================================================
         VERIFY OWNERSHIP
      ===================================================== */

      const [rows]: any =
        await db.execute(
          `
            SELECT
              id

            FROM notifications

            WHERE id = ?
            AND user_id = ?

            LIMIT 1
          `,
          [
            notificationId,
            userId,
          ]
        );

      if (
        rows.length ===
        0
      ) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      /* =====================================================
         UPDATE
      ===================================================== */

      await db.execute(
        `
          UPDATE notifications

          SET
            is_read = TRUE

          WHERE id = ?
          AND user_id = ?
        `,
        [
          notificationId,
          userId,
        ]
      );

      return res.status(200).json({
        message:
          "Notification marked as read",
      });
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to mark notification as read",
      });
    }
  };

/* =========================================================
   MARK ALL NOTIFICATIONS AS READ
========================================================= */

export const markAllNotificationsAsRead =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      /* =====================================================
         AUTH
      ===================================================== */

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      /* =====================================================
         UPDATE ALL
      ===================================================== */

      const [result]: any =
        await db.execute(
          `
            UPDATE notifications

            SET
              is_read = TRUE

            WHERE user_id = ?
            AND is_read = FALSE
          `,
          [
            userId,
          ]
        );

      return res.status(200).json({
        message:
          "All notifications marked as read",

        updated:
          Number(
            result.affectedRows ||
              0
          ),
      });
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to mark all notifications as read",
      });
    }
  };

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

export const deleteNotification =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      const notificationId =
        Number(
          req.params.id
        );

      /* =====================================================
         AUTH
      ===================================================== */

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      /* =====================================================
         VALIDATE ID
      ===================================================== */

      if (
        !Number.isInteger(
          notificationId
        ) ||
        notificationId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid notification ID",
        });
      }

      /* =====================================================
         DELETE
      ===================================================== */

      const [result]: any =
        await db.execute(
          `
            DELETE FROM notifications

            WHERE id = ?
            AND user_id = ?
          `,
          [
            notificationId,
            userId,
          ]
        );

      if (
        result.affectedRows ===
        0
      ) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      return res.status(200).json({
        message:
          "Notification deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete notification",
      });
    }
  };