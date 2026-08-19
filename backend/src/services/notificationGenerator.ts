import type {
  RowDataPacket,
} from "mysql2";

import db from "../config/db";

import {
  createNotification,
} from "./notificationService";

/* =========================================================
   DATABASE TYPES
========================================================= */

type InterviewRow =
  RowDataPacket & {
    id: number;
    scheduled_at:
      string | Date;

    interview_type:
      string;

    company:
      string;

    job_title:
      string;
  };

type SavedJobRow =
  RowDataPacket & {
    id: number;

    deadline:
      string | Date;

    company:
      string;

    job_title:
      string;
  };

/* =========================================================
   VALIDATION
========================================================= */

const validateUserId = (
  userId: number
) => {
  if (
    !Number.isInteger(
      userId
    ) ||
    userId <= 0
  ) {
    throw new Error(
      "Invalid notification user ID."
    );
  }
};

/* =========================================================
   FORMAT DATETIME
========================================================= */

const formatDateTime = (
  value:
    string | Date
) => {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    undefined,
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    }
  );
};

/* =========================================================
   FORMAT DATE

   Avoid unnecessary UTC conversion for MySQL DATE strings.
========================================================= */

const formatDate = (
  value:
    string | Date
) => {
  if (
    typeof value ===
    "string"
  ) {
    const dateOnlyMatch =
      value.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );

    if (
      dateOnlyMatch
    ) {
      const year =
        Number(
          dateOnlyMatch[1]
        );

      const month =
        Number(
          dateOnlyMatch[2]
        );

      const day =
        Number(
          dateOnlyMatch[3]
        );

      const localDate =
        new Date(
          year,
          month - 1,
          day
        );

      return localDate
        .toLocaleDateString(
          undefined,
          {
            year:
              "numeric",

            month:
              "short",

            day:
              "numeric",
          }
        );
    }
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",
    }
  );
};

/* =========================================================
   INTERVIEW REMINDERS
========================================================= */

const generateInterviewNotifications =
  async (
    userId: number
  ) => {
    const [
      rows,
    ] =
      await db.execute<
        InterviewRow[]
      >(
        `
          SELECT
            i.id,
            i.scheduled_at,
            i.interview_type,
            a.company,
            a.job_title

          FROM interviews i

          INNER JOIN applications a
            ON a.id = i.application_id

          WHERE
            i.user_id = ?
            AND a.user_id = ?

            AND i.scheduled_at >= NOW()

            AND i.scheduled_at <=
              DATE_ADD(
                NOW(),
                INTERVAL 24 HOUR
              )

          ORDER BY
            i.scheduled_at ASC
        `,
        [
          userId,
          userId,
        ]
      );

    for (
      const interview
      of rows
    ) {
      await createNotification({
        userId,

        type:
          "interview_reminder",

        title:
          "Upcoming interview",

        message:
          `${interview.interview_type} for ${interview.job_title} at ${interview.company} is scheduled for ${formatDateTime(
            interview.scheduled_at
          )}.`,

        relatedType:
          "interview",

        relatedId:
          interview.id,

        actionUrl:
          "/interviews",
      });
    }
  };

/* =========================================================
   SAVED JOB DEADLINE REMINDERS
========================================================= */

const generateSavedJobDeadlineNotifications =
  async (
    userId: number
  ) => {
    const [
      rows,
    ] =
      await db.execute<
        SavedJobRow[]
      >(
        `
          SELECT
            id,
            company,
            job_title,
            deadline

          FROM saved_jobs

          WHERE
            user_id = ?

            AND deadline IS NOT NULL

            AND deadline >=
              CURDATE()

            AND deadline <=
              DATE_ADD(
                CURDATE(),
                INTERVAL 3 DAY
              )

          ORDER BY
            deadline ASC
        `,
        [
          userId,
        ]
      );

    for (
      const savedJob
      of rows
    ) {
      await createNotification({
        userId,

        type:
          "saved_job_deadline",

        title:
          "Saved job deadline approaching",

        message:
          `${savedJob.job_title} at ${savedJob.company} has an application deadline on ${formatDate(
            savedJob.deadline
          )}.`,

        relatedType:
          "saved_job",

        relatedId:
          savedJob.id,

        actionUrl:
          "/saved-jobs",
      });
    }
  };

/* =========================================================
   FOLLOW-UP REMINDERS
========================================================= */

const generateFollowUpNotifications =
  async (
    userId: number
  ) => {
    const [
      rows,
    ] =
      await db.execute<
        InterviewRow[]
      >(
        `
          SELECT
            i.id,
            i.scheduled_at,
            i.interview_type,
            a.company,
            a.job_title

          FROM interviews i

          INNER JOIN applications a
            ON a.id = i.application_id

          WHERE
            i.user_id = ?
            AND a.user_id = ?

            AND i.follow_up_date
              IS NOT NULL

            AND DATE(
              i.follow_up_date
            ) <= CURDATE()

          ORDER BY
            i.follow_up_date ASC
        `,
        [
          userId,
          userId,
        ]
      );

    for (
      const interview
      of rows
    ) {
      await createNotification({
        userId,

        type:
          "follow_up_reminder",

        title:
          "Interview follow-up due",

        message:
          `Follow up on your ${interview.interview_type} for ${interview.job_title} at ${interview.company}.`,

        relatedType:
          "interview",

        relatedId:
          interview.id,

        actionUrl:
          "/interviews",
      });
    }
  };

/* =========================================================
   GENERATE ALL USER NOTIFICATIONS
========================================================= */

export const generateUserNotifications =
  async (
    userId: number
  ) => {
    validateUserId(
      userId
    );

    /*
     * These queries are independent.
     *
     * Promise.all is safe here because the controller will
     * separately catch notification-maintenance errors and
     * still allow existing notifications to load.
     */
    await Promise.all([
      generateInterviewNotifications(
        userId
      ),

      generateSavedJobDeadlineNotifications(
        userId
      ),

      generateFollowUpNotifications(
        userId
      ),
    ]);
  };