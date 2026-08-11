import db from "../config/db";

/* =========================================================
   REMOVE STALE INTERVIEW NOTIFICATIONS
========================================================= */

const cleanupInterviewNotifications =
  async (
    userId: number
  ) => {
    /*
     * Remove interview reminders when:
     * - the interview was deleted
     * - the interview belongs to another user
     * - the interview time already passed
     */

    await db.execute(
      `
        DELETE n
        FROM notifications n

        LEFT JOIN interviews i
          ON i.id = n.related_id

        LEFT JOIN applications a
          ON a.id = i.application_id

        WHERE n.user_id = ?
        AND n.related_type = 'interview'
        AND n.type = 'interview_reminder'
        AND (
          i.id IS NULL
          OR a.user_id IS NULL
          OR a.user_id <> ?
          OR i.scheduled_at < NOW()
        )
      `,
      [
        userId,
        userId,
      ]
    );
  };

/* =========================================================
   REMOVE STALE FOLLOW-UP NOTIFICATIONS
========================================================= */

const cleanupFollowUpNotifications =
  async (
    userId: number
  ) => {
    /*
     * Remove follow-up reminders when:
     * - the interview no longer exists
     * - the interview no longer belongs to the user
     * - follow_up_date was removed
     */

    await db.execute(
      `
        DELETE n
        FROM notifications n

        LEFT JOIN interviews i
          ON i.id = n.related_id

        LEFT JOIN applications a
          ON a.id = i.application_id

        WHERE n.user_id = ?
        AND n.related_type = 'interview'
        AND n.type = 'follow_up_reminder'
        AND (
          i.id IS NULL
          OR a.user_id IS NULL
          OR a.user_id <> ?
          OR i.follow_up_date IS NULL
        )
      `,
      [
        userId,
        userId,
      ]
    );
  };

/* =========================================================
   REMOVE STALE SAVED JOB NOTIFICATIONS
========================================================= */

const cleanupSavedJobNotifications =
  async (
    userId: number
  ) => {
    /*
     * Remove deadline reminders when:
     * - the saved job was deleted
     * - the saved job no longer belongs to the user
     * - its deadline was removed
     * - its deadline already passed
     */

    await db.execute(
      `
        DELETE n
        FROM notifications n

        LEFT JOIN saved_jobs s
          ON s.id = n.related_id

        WHERE n.user_id = ?
        AND n.related_type = 'saved_job'
        AND n.type = 'saved_job_deadline'
        AND (
          s.id IS NULL
          OR s.user_id <> ?
          OR s.deadline IS NULL
          OR s.deadline < CURDATE()
        )
      `,
      [
        userId,
        userId,
      ]
    );
  };

/* =========================================================
   REFRESH INTERVIEW NOTIFICATION CONTENT
========================================================= */

const updateInterviewNotifications =
  async (
    userId: number
  ) => {
    /*
     * If the user edits company, job title,
     * interview type, or scheduled date,
     * update the notification text instead
     * of leaving old information.
     */

    const [rows]: any =
      await db.execute(
        `
          SELECT
            n.id AS notification_id,

            i.id AS interview_id,

            i.interview_type,

            i.scheduled_at,

            a.company,

            a.job_title

          FROM notifications n

          INNER JOIN interviews i
            ON i.id = n.related_id

          INNER JOIN applications a
            ON a.id = i.application_id

          WHERE n.user_id = ?
          AND a.user_id = ?
          AND n.related_type = 'interview'
          AND n.type = 'interview_reminder'
        `,
        [
          userId,
          userId,
        ]
      );

    for (
      const row
      of rows
    ) {
      const scheduledDate =
        new Date(
          row.scheduled_at
        );

      const formattedDate =
        Number.isNaN(
          scheduledDate.getTime()
        )
          ? String(
              row.scheduled_at
            )
          : scheduledDate.toLocaleString();

      const message =
        `${row.interview_type} for ${row.job_title} at ${row.company} is scheduled for ${formattedDate}.`;

      await db.execute(
        `
          UPDATE notifications

          SET
            title = ?,
            message = ?,
            action_url = ?,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = ?
          AND user_id = ?
        `,
        [
          "Upcoming interview",

          message,

          "/interviews",

          row.notification_id,

          userId,
        ]
      );
    }
  };

/* =========================================================
   REFRESH FOLLOW-UP NOTIFICATION CONTENT
========================================================= */

const updateFollowUpNotifications =
  async (
    userId: number
  ) => {
    const [rows]: any =
      await db.execute(
        `
          SELECT
            n.id AS notification_id,

            i.interview_type,

            a.company,

            a.job_title

          FROM notifications n

          INNER JOIN interviews i
            ON i.id = n.related_id

          INNER JOIN applications a
            ON a.id = i.application_id

          WHERE n.user_id = ?
          AND a.user_id = ?
          AND n.related_type = 'interview'
          AND n.type = 'follow_up_reminder'
        `,
        [
          userId,
          userId,
        ]
      );

    for (
      const row
      of rows
    ) {
      const message =
        `Follow up on your ${row.interview_type} for ${row.job_title} at ${row.company}.`;

      await db.execute(
        `
          UPDATE notifications

          SET
            title = ?,
            message = ?,
            action_url = ?,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = ?
          AND user_id = ?
        `,
        [
          "Interview follow-up due",

          message,

          "/interviews",

          row.notification_id,

          userId,
        ]
      );
    }
  };

/* =========================================================
   REFRESH SAVED JOB NOTIFICATION CONTENT
========================================================= */

const updateSavedJobNotifications =
  async (
    userId: number
  ) => {
    const [rows]: any =
      await db.execute(
        `
          SELECT
            n.id AS notification_id,

            s.company,

            s.job_title,

            s.deadline

          FROM notifications n

          INNER JOIN saved_jobs s
            ON s.id = n.related_id

          WHERE n.user_id = ?
          AND s.user_id = ?
          AND n.related_type = 'saved_job'
          AND n.type = 'saved_job_deadline'
        `,
        [
          userId,
          userId,
        ]
      );

    for (
      const row
      of rows
    ) {
      const deadlineDate =
        new Date(
          row.deadline
        );

      const formattedDate =
        Number.isNaN(
          deadlineDate.getTime()
        )
          ? String(
              row.deadline
            )
          : deadlineDate.toLocaleDateString();

      const message =
        `${row.job_title} at ${row.company} has an application deadline on ${formattedDate}.`;

      await db.execute(
        `
          UPDATE notifications

          SET
            title = ?,
            message = ?,
            action_url = ?,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = ?
          AND user_id = ?
        `,
        [
          "Saved job deadline approaching",

          message,

          "/saved-jobs",

          row.notification_id,

          userId,
        ]
      );
    }
  };

/* =========================================================
   REMOVE OLD READ NOTIFICATIONS
========================================================= */

const cleanupOldReadNotifications =
  async (
    userId: number
  ) => {
    /*
     * Keep the notification table from growing forever.
     *
     * Read notifications older than 30 days
     * are automatically removed.
     */

    await db.execute(
      `
        DELETE FROM notifications

        WHERE user_id = ?
        AND is_read = TRUE
        AND created_at <
          DATE_SUB(
            NOW(),
            INTERVAL 30 DAY
          )
      `,
      [
        userId,
      ]
    );
  };

/* =========================================================
   MAIN SYNC FUNCTION
========================================================= */

export const syncUserNotifications =
  async (
    userId: number
  ) => {
    await cleanupInterviewNotifications(
      userId
    );

    await cleanupFollowUpNotifications(
      userId
    );

    await cleanupSavedJobNotifications(
      userId
    );

    await updateInterviewNotifications(
      userId
    );

    await updateFollowUpNotifications(
      userId
    );

    await updateSavedJobNotifications(
      userId
    );

    await cleanupOldReadNotifications(
      userId
    );
  };