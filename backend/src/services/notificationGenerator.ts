import db from "../config/db";
import {
  createNotification,
} from "./notificationService";

/* =========================================================
   HELPERS
========================================================= */

const notificationExists = async (
  userId: number,
  type: string,
  relatedType: string,
  relatedId: number
) => {
  const [rows]: any =
    await db.execute(
      `
        SELECT id
        FROM notifications
        WHERE user_id = ?
        AND type = ?
        AND related_type = ?
        AND related_id = ?
        LIMIT 1
      `,
      [
        userId,
        type,
        relatedType,
        relatedId,
      ]
    );

  return rows.length > 0;
};

/* =========================================================
   GENERATE INTERVIEW REMINDERS
========================================================= */

const generateInterviewNotifications =
  async (
    userId: number
  ) => {
    const [rows]: any =
      await db.execute(
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

          WHERE a.user_id = ?
          AND i.scheduled_at >= NOW()
          AND i.scheduled_at <= DATE_ADD(
            NOW(),
            INTERVAL 24 HOUR
          )

          ORDER BY
            i.scheduled_at ASC
        `,
        [
          userId,
        ]
      );

    for (
      const interview
      of rows
    ) {
      const exists =
        await notificationExists(
          userId,
          "interview_reminder",
          "interview",
          interview.id
        );

      if (exists) {
        continue;
      }

      const scheduledDate =
        new Date(
          interview.scheduled_at
        );

      const formattedDate =
        Number.isNaN(
          scheduledDate.getTime()
        )
          ? interview.scheduled_at
          : scheduledDate.toLocaleString();

      await createNotification({
        userId,

        type:
          "interview_reminder",

        title:
          "Upcoming interview",

        message:
          `${interview.interview_type} for ${interview.job_title} at ${interview.company} is scheduled for ${formattedDate}.`,

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
   GENERATE SAVED JOB DEADLINE REMINDERS
========================================================= */

const generateSavedJobDeadlineNotifications =
  async (
    userId: number
  ) => {
    const [rows]: any =
      await db.execute(
        `
          SELECT
            id,
            company,
            job_title,
            deadline

          FROM saved_jobs

          WHERE user_id = ?
          AND deadline IS NOT NULL
          AND deadline >= CURDATE()
          AND deadline <= DATE_ADD(
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
      const exists =
        await notificationExists(
          userId,
          "saved_job_deadline",
          "saved_job",
          savedJob.id
        );

      if (exists) {
        continue;
      }

      const deadlineDate =
        new Date(
          savedJob.deadline
        );

      const formattedDate =
        Number.isNaN(
          deadlineDate.getTime()
        )
          ? savedJob.deadline
          : deadlineDate.toLocaleDateString();

      await createNotification({
        userId,

        type:
          "saved_job_deadline",

        title:
          "Saved job deadline approaching",

        message:
          `${savedJob.job_title} at ${savedJob.company} has an application deadline on ${formattedDate}.`,

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
   GENERATE FOLLOW-UP REMINDERS
========================================================= */

const generateFollowUpNotifications =
  async (
    userId: number
  ) => {
    const [rows]: any =
      await db.execute(
        `
          SELECT
            i.id,
            i.follow_up_date,
            i.interview_type,
            a.company,
            a.job_title

          FROM interviews i

          INNER JOIN applications a
            ON a.id = i.application_id

          WHERE a.user_id = ?
          AND i.follow_up_date IS NOT NULL
          AND DATE(
            i.follow_up_date
          ) <= CURDATE()
        `,
        [
          userId,
        ]
      );

    for (
      const interview
      of rows
    ) {
      const exists =
        await notificationExists(
          userId,
          "follow_up_reminder",
          "interview",
          interview.id
        );

      if (exists) {
        continue;
      }

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