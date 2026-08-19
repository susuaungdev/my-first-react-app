import type {
  ResultSetHeader,
} from "mysql2";

import db from "../config/db";

/* =========================================================
   TYPES
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
   HELPERS
========================================================= */

const cleanRequiredString = (
  value: string,
  label: string,
  maxLength: number
) => {
  const cleaned =
    value.trim();

  if (!cleaned) {
    throw new Error(
      `${label} is required.`
    );
  }

  if (
    cleaned.length >
    maxLength
  ) {
    throw new Error(
      `${label} is too long.`
    );
  }

  return cleaned;
};

const cleanOptionalString = (
  value: string | null | undefined,
  label: string,
  maxLength: number
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const cleaned =
    value.trim();

  if (!cleaned) {
    return null;
  }

  if (
    cleaned.length >
    maxLength
  ) {
    throw new Error(
      `${label} is too long.`
    );
  }

  return cleaned;
};

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

export const createNotification =
  async (
    input:
      CreateNotificationInput
  ) => {
    /* =====================================================
       USER
    ===================================================== */

    if (
      !Number.isInteger(
        input.userId
      ) ||
      input.userId <= 0
    ) {
      throw new Error(
        "Invalid notification user ID."
      );
    }

    /* =====================================================
       CLEAN VALUES

       These limits match your MySQL table:
       type         VARCHAR(50)
       title        VARCHAR(255)
       related_type VARCHAR(50)
       action_url   VARCHAR(255)
    ===================================================== */

    const type =
      cleanRequiredString(
        input.type,
        "Notification type",
        50
      );

    const title =
      cleanRequiredString(
        input.title,
        "Notification title",
        255
      );

    const message =
      cleanRequiredString(
        input.message,
        "Notification message",
        5000
      );

    const relatedType =
      cleanOptionalString(
        input.relatedType,
        "Related notification type",
        50
      );

    const actionUrl =
      cleanOptionalString(
        input.actionUrl,
        "Notification action URL",
        255
      );

    const relatedId =
      input.relatedId ??
      null;

    /* =====================================================
       RELATED ID
    ===================================================== */

    if (
      relatedId !== null &&
      (
        !Number.isInteger(
          relatedId
        ) ||
        relatedId <= 0
      )
    ) {
      throw new Error(
        "Invalid related notification ID."
      );
    }

    /*
     * Require both relationship values together.
     *
     * This also helps the UNIQUE index:
     * user_id + type + related_type + related_id
     */
    if (
      (
        relatedType === null &&
        relatedId !== null
      ) ||
      (
        relatedType !== null &&
        relatedId === null
      )
    ) {
      throw new Error(
        "Notification relationship is incomplete."
      );
    }

    /* =====================================================
       ACTION URL
    ===================================================== */

    if (
      actionUrl &&
      (
        !actionUrl.startsWith(
          "/"
        ) ||
        actionUrl.startsWith(
          "//"
        )
      )
    ) {
      throw new Error(
        "Invalid notification action URL."
      );
    }

    /* =====================================================
       INSERT

       Your table has a UNIQUE key on:
       user_id + type + related_type + related_id

       Therefore a reminder for the same object is updated
       instead of duplicated.

       We intentionally do NOT reset is_read here.
       If the user already read a reminder, repeatedly loading
       the page should not make it unread again.
    ===================================================== */

    const [
      result,
    ] =
      await db.execute<ResultSetHeader>(
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
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            FALSE,
            ?
          )

          ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            title = VALUES(title),
            message = VALUES(message),
            action_url = VALUES(action_url),
            updated_at = CURRENT_TIMESTAMP
        `,
        [
          input.userId,
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

      userId:
        input.userId,

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