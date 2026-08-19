import db from "../config/db";

/* =========================================================
   VALIDATE USER
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
   SYNC USER NOTIFICATIONS
========================================================= */

export const syncUserNotifications =
  async (
    userId: number
  ) => {
    validateUserId(
      userId
    );

    /* =====================================================
       REMOVE INVALID INTERVIEW REMINDERS

       Remove if:
       - interview was deleted
       - application was deleted
       - interview already happened
       - interview was moved more than 24 hours away
    ===================================================== */

    await db.execute(
      `
        DELETE n

        FROM notifications n

        LEFT JOIN interviews i
          ON i.id = n.related_id
          AND i.user_id = n.user_id

        LEFT JOIN applications a
          ON a.id = i.application_id
          AND a.user_id = n.user_id

        WHERE
          n.user_id = ?

          AND n.related_type =
            'interview'

          AND n.type =
            'interview_reminder'

          AND (
            i.id IS NULL

            OR a.id IS NULL

            OR i.scheduled_at <
              NOW()

            OR i.scheduled_at >
              DATE_ADD(
                NOW(),
                INTERVAL 24 HOUR
              )
          )
      `,
      [
        userId,
      ]
    );

    /* =====================================================
       REMOVE INVALID FOLLOW-UP REMINDERS

       Remove if:
       - interview deleted
       - application deleted
       - follow-up removed
       - follow-up changed to a future date
    ===================================================== */

    await db.execute(
      `
        DELETE n

        FROM notifications n

        LEFT JOIN interviews i
          ON i.id = n.related_id
          AND i.user_id = n.user_id

        LEFT JOIN applications a
          ON a.id = i.application_id
          AND a.user_id = n.user_id

        WHERE
          n.user_id = ?

          AND n.related_type =
            'interview'

          AND n.type =
            'follow_up_reminder'

          AND (
            i.id IS NULL

            OR a.id IS NULL

            OR i.follow_up_date
              IS NULL

            OR DATE(
              i.follow_up_date
            ) > CURDATE()
          )
      `,
      [
        userId,
      ]
    );

    /* =====================================================
       REMOVE INVALID SAVED JOB DEADLINE REMINDERS

       Remove if:
       - job deleted
       - deadline removed
       - deadline already passed
       - deadline moved more than 3 days away
    ===================================================== */

    await db.execute(
      `
        DELETE n

        FROM notifications n

        LEFT JOIN saved_jobs s
          ON s.id = n.related_id
          AND s.user_id = n.user_id

        WHERE
          n.user_id = ?

          AND n.related_type =
            'saved_job'

          AND n.type =
            'saved_job_deadline'

          AND (
            s.id IS NULL

            OR s.deadline IS NULL

            OR s.deadline <
              CURDATE()

            OR s.deadline >
              DATE_ADD(
                CURDATE(),
                INTERVAL 3 DAY
              )
          )
      `,
      [
        userId,
      ]
    );

    /* =====================================================
       UPDATE ACTIVE INTERVIEW REMINDERS
    ===================================================== */

    await db.execute(
      `
        UPDATE notifications n

        INNER JOIN interviews i
          ON i.id = n.related_id
          AND i.user_id = n.user_id

        INNER JOIN applications a
          ON a.id = i.application_id
          AND a.user_id = n.user_id

        SET
          n.title =
            'Upcoming interview',

          n.message =
            CONCAT(
              i.interview_type,
              ' for ',
              a.job_title,
              ' at ',
              a.company,
              ' is scheduled for ',
              DATE_FORMAT(
                i.scheduled_at,
                '%b %e, %Y, %l:%i %p'
              ),
              '.'
            ),

          n.action_url =
            '/interviews',

          n.updated_at =
            CURRENT_TIMESTAMP

        WHERE
          n.user_id = ?

          AND n.related_type =
            'interview'

          AND n.type =
            'interview_reminder'

          AND i.scheduled_at >=
            NOW()

          AND i.scheduled_at <=
            DATE_ADD(
              NOW(),
              INTERVAL 24 HOUR
            )
      `,
      [
        userId,
      ]
    );

    /* =====================================================
       UPDATE ACTIVE FOLLOW-UP REMINDERS
    ===================================================== */

    await db.execute(
      `
        UPDATE notifications n

        INNER JOIN interviews i
          ON i.id = n.related_id
          AND i.user_id = n.user_id

        INNER JOIN applications a
          ON a.id = i.application_id
          AND a.user_id = n.user_id

        SET
          n.title =
            'Interview follow-up due',

          n.message =
            CONCAT(
              'Follow up on your ',
              i.interview_type,
              ' for ',
              a.job_title,
              ' at ',
              a.company,
              '.'
            ),

          n.action_url =
            '/interviews',

          n.updated_at =
            CURRENT_TIMESTAMP

        WHERE
          n.user_id = ?

          AND n.related_type =
            'interview'

          AND n.type =
            'follow_up_reminder'

          AND i.follow_up_date
            IS NOT NULL

          AND DATE(
            i.follow_up_date
          ) <= CURDATE()
      `,
      [
        userId,
      ]
    );

    /* =====================================================
       UPDATE ACTIVE SAVED JOB REMINDERS
    ===================================================== */

    await db.execute(
      `
        UPDATE notifications n

        INNER JOIN saved_jobs s
          ON s.id = n.related_id
          AND s.user_id = n.user_id

        SET
          n.title =
            'Saved job deadline approaching',

          n.message =
            CONCAT(
              s.job_title,
              ' at ',
              s.company,
              ' has an application deadline on ',
              DATE_FORMAT(
                s.deadline,
                '%b %e, %Y'
              ),
              '.'
            ),

          n.action_url =
            '/saved-jobs',

          n.updated_at =
            CURRENT_TIMESTAMP

        WHERE
          n.user_id = ?

          AND n.related_type =
            'saved_job'

          AND n.type =
            'saved_job_deadline'

          AND s.deadline >=
            CURDATE()

          AND s.deadline <=
            DATE_ADD(
              CURDATE(),
              INTERVAL 3 DAY
            )
      `,
      [
        userId,
      ]
    );

    /* =====================================================
       CLEAN OLD READ NOTIFICATIONS
    ===================================================== */

    await db.execute(
      `
        DELETE FROM notifications

        WHERE
          user_id = ?

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