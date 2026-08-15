import db from "../config/db";

const validUserId = (userId: number) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid notification user ID.");
  }
};

export const syncUserNotifications = async (userId: number) => {
  validUserId(userId);

  await db.execute(
    `DELETE n FROM notifications n
     LEFT JOIN interviews i ON i.id = n.related_id AND i.user_id = n.user_id
     LEFT JOIN applications a ON a.id = i.application_id AND a.user_id = n.user_id
     WHERE n.user_id = ? AND n.related_type = 'interview'
       AND n.type = 'interview_reminder'
       AND (i.id IS NULL OR a.id IS NULL OR i.scheduled_at < NOW())`,
    [userId]
  );

  await db.execute(
    `DELETE n FROM notifications n
     LEFT JOIN interviews i ON i.id = n.related_id AND i.user_id = n.user_id
     LEFT JOIN applications a ON a.id = i.application_id AND a.user_id = n.user_id
     WHERE n.user_id = ? AND n.related_type = 'interview'
       AND n.type = 'follow_up_reminder'
       AND (i.id IS NULL OR a.id IS NULL OR i.follow_up_date IS NULL)`,
    [userId]
  );

  await db.execute(
    `DELETE n FROM notifications n
     LEFT JOIN saved_jobs s ON s.id = n.related_id AND s.user_id = n.user_id
     WHERE n.user_id = ? AND n.related_type = 'saved_job'
       AND n.type = 'saved_job_deadline'
       AND (s.id IS NULL OR s.deadline IS NULL OR s.deadline < CURDATE())`,
    [userId]
  );

  await db.execute(
    `UPDATE notifications n
     INNER JOIN interviews i ON i.id = n.related_id AND i.user_id = n.user_id
     INNER JOIN applications a ON a.id = i.application_id AND a.user_id = n.user_id
     SET n.title = 'Upcoming interview',
       n.message = CONCAT(i.interview_type, ' for ', a.job_title, ' at ', a.company,
         ' is scheduled for ', DATE_FORMAT(i.scheduled_at, '%b %e, %Y, %l:%i %p'), '.'),
       n.action_url = '/interviews', n.updated_at = CURRENT_TIMESTAMP
     WHERE n.user_id = ? AND n.related_type = 'interview'
       AND n.type = 'interview_reminder'`,
    [userId]
  );

  await db.execute(
    `UPDATE notifications n
     INNER JOIN interviews i ON i.id = n.related_id AND i.user_id = n.user_id
     INNER JOIN applications a ON a.id = i.application_id AND a.user_id = n.user_id
     SET n.title = 'Interview follow-up due',
       n.message = CONCAT('Follow up on your ', i.interview_type, ' for ',
         a.job_title, ' at ', a.company, '.'),
       n.action_url = '/interviews', n.updated_at = CURRENT_TIMESTAMP
     WHERE n.user_id = ? AND n.related_type = 'interview'
       AND n.type = 'follow_up_reminder'`,
    [userId]
  );

  await db.execute(
    `UPDATE notifications n
     INNER JOIN saved_jobs s ON s.id = n.related_id AND s.user_id = n.user_id
     SET n.title = 'Saved job deadline approaching',
       n.message = CONCAT(s.job_title, ' at ', s.company,
         ' has an application deadline on ', DATE_FORMAT(s.deadline, '%b %e, %Y'), '.'),
       n.action_url = '/saved-jobs', n.updated_at = CURRENT_TIMESTAMP
     WHERE n.user_id = ? AND n.related_type = 'saved_job'
       AND n.type = 'saved_job_deadline'`,
    [userId]
  );

  await db.execute(
    `DELETE FROM notifications
     WHERE user_id = ? AND is_read = TRUE
       AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [userId]
  );
};