import {
  Request,
  Response,
} from "express";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import db from "../config/db";

import {
  generateUserNotifications,
} from "../services/notificationGenerator";

import {
  syncUserNotifications,
} from "../services/notificationSyncService";

/* =========================================================
   DATABASE TYPES
========================================================= */

type NotificationRow =
  RowDataPacket & {
    id: number;
    type: string;
    title: string;
    message: string;

    related_type:
      string | null;

    related_id:
      number | null;

    is_read:
      number | boolean;

    action_url:
      string | null;

    created_at:
      string | Date;

    updated_at:
      string | Date;
  };

type CountRow =
  RowDataPacket & {
    unread_count: number;
  };

type IdRow =
  RowDataPacket & {
    id: number;
  };

/* =========================================================
   USER ID HELPER
========================================================= */

const getAuthenticatedUserId = (
  req: Request
) => {
  const userId =
    req.user?.id;

  if (
    !userId ||
    !Number.isInteger(
      userId
    ) ||
    userId <= 0
  ) {
    return null;
  }

  return userId;
};

/* =========================================================
   REFRESH GENERATED NOTIFICATIONS

   Synchronization/generation should never prevent users from
   reading notifications already stored in the database.
========================================================= */

const refreshUserNotifications =
  async (
    userId: number
  ) => {
    try {
      await syncUserNotifications(
        userId
      );
    } catch (error) {
      console.error(
        "Notification synchronization error:",
        error
      );
    }

    try {
      await generateUserNotifications(
        userId
      );
    } catch (error) {
      console.error(
        "Notification generation error:",
        error
      );
    }
  };

/* =========================================================
   GET NOTIFICATIONS
========================================================= */

export const getNotifications =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(
          req
        );

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      /* =====================================================
         REFRESH REMINDERS

         Failure here is logged but does not stop the API.
      ===================================================== */

      await refreshUserNotifications(
        userId
      );

      /* =====================================================
         FETCH
      ===================================================== */

      const [
        rows,
      ] =
        await db.execute<
          NotificationRow[]
        >(
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

      return res.status(200).json({
        message:
          "Notifications fetched successfully",

        notifications:
          rows.map(
            (
              row
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
        getAuthenticatedUserId(
          req
        );

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      /*
       * Ensure reminders are reasonably current.
       *
       * As above, generator/sync failures won't destroy the
       * unread-count API.
       */
      await refreshUserNotifications(
        userId
      );

      const [
        rows,
      ] =
        await db.execute<
          CountRow[]
        >(
          `
            SELECT
              COUNT(*) AS unread_count

            FROM notifications

            WHERE
              user_id = ?

              AND is_read =
                FALSE
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
              ?.unread_count ??
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
   MARK ONE AS READ
========================================================= */

export const markNotificationAsRead =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(
          req
        );

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      const notificationId =
        Number(
          req.params.id
        );

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
         OWNERSHIP
      ===================================================== */

      const [
        rows,
      ] =
        await db.execute<
          IdRow[]
        >(
          `
            SELECT
              id

            FROM notifications

            WHERE
              id = ?

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

      await db.execute<ResultSetHeader>(
        `
          UPDATE notifications

          SET
            is_read = TRUE,
            updated_at =
              CURRENT_TIMESTAMP

          WHERE
            id = ?

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
   MARK ALL AS READ
========================================================= */

export const markAllNotificationsAsRead =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(
          req
        );

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      const [
        result,
      ] =
        await db.execute<ResultSetHeader>(
          `
            UPDATE notifications

            SET
              is_read = TRUE,
              updated_at =
                CURRENT_TIMESTAMP

            WHERE
              user_id = ?

              AND is_read =
                FALSE
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
        getAuthenticatedUserId(
          req
        );

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      const notificationId =
        Number(
          req.params.id
        );

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

      const [
        result,
      ] =
        await db.execute<ResultSetHeader>(
          `
            DELETE FROM notifications

            WHERE
              id = ?

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