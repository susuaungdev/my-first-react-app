import db from "../config/db";

/* =========================================================
   CREATE NOTIFICATION INPUT
========================================================= */

export type CreateNotificationInput = {
  userId: number;

  type: string;

  title: string;

  message: string;

  relatedType?: string | null;

  relatedId?: number | null;

  actionUrl?: string | null;
};

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

export const createNotification =
  async (
    input: CreateNotificationInput
  ) => {
    const {
      userId,
      type,
      title,
      message,
      relatedType = null,
      relatedId = null,
      actionUrl = null,
    } = input;

    const [result]: any =
      await db.execute(
        `
          INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            related_type,
            related_id,
            is_read,
            action_url
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, FALSE, ?
          )
        `,
        [
          userId,
          type,
          title,
          message,
          relatedType,
          relatedId,
          actionUrl,
        ]
      );

    return {
      id:
        result.insertId,

      userId,

      type,

      title,

      message,

      relatedType,

      relatedId,

      isRead:
        false,

      actionUrl,
    };
  };