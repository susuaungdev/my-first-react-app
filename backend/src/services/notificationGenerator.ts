import type { RowDataPacket } from "mysql2";
import db from "../config/db";
import { createNotification } from "./notificationService";

type InterviewRow = RowDataPacket & {
  id: number;
  scheduled_at: string | Date;
  interview_type: string;
  company: string;
  job_title: string;
};

type SavedJobRow = RowDataPacket & {
  id: number;
  deadline: string | Date;
  company: string;
  job_title: string;
};

const validUserId = (userId: number) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid notification user ID.");
  }
};

const formatDateTime = (value: string | Date) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const formatDate = (value: string | Date) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

const generateInterviewNotifications = async (userId: number) => {
  const [rows] = await db.execute<InterviewRow[]>(
    `SELECT i.id, i.scheduled_at, i.interview_type, a.company, a.job_title
     FROM interviews i
     INNER JOIN applications a ON a.id = i.application_id
     WHERE i.user_id = ? AND a.user_id = ?
       AND i.scheduled_at >= NOW()
       AND i.scheduled_at <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
     ORDER BY i.scheduled_at ASC`,
    [userId, userId]
  );

  for (const interview of rows) {
    await createNotification({
      userId,
      type: "interview_reminder",
      title: "Upcoming interview",
      message: `${interview.interview_type} for ${interview.job_title} at ${interview.company} is scheduled for ${formatDateTime(interview.scheduled_at)}.`,
      relatedType: "interview",
      relatedId: interview.id,
      actionUrl: "/interviews",
    });
  }
};

const generateSavedJobDeadlineNotifications = async (userId: number) => {
  const [rows] = await db.execute<SavedJobRow[]>(
    `SELECT id, company, job_title, deadline
     FROM saved_jobs
     WHERE user_id = ? AND deadline IS NOT NULL
       AND deadline >= CURDATE()
       AND deadline <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
     ORDER BY deadline ASC`,
    [userId]
  );

  for (const savedJob of rows) {
    await createNotification({
      userId,
      type: "saved_job_deadline",
      title: "Saved job deadline approaching",
      message: `${savedJob.job_title} at ${savedJob.company} has an application deadline on ${formatDate(savedJob.deadline)}.`,
      relatedType: "saved_job",
      relatedId: savedJob.id,
      actionUrl: "/saved-jobs",
    });
  }
};

const generateFollowUpNotifications = async (userId: number) => {
  const [rows] = await db.execute<InterviewRow[]>(
    `SELECT i.id, i.scheduled_at, i.interview_type, a.company, a.job_title
     FROM interviews i
     INNER JOIN applications a ON a.id = i.application_id
     WHERE i.user_id = ? AND a.user_id = ?
       AND i.follow_up_date IS NOT NULL
       AND DATE(i.follow_up_date) <= CURDATE()`,
    [userId, userId]
  );

  for (const interview of rows) {
    await createNotification({
      userId,
      type: "follow_up_reminder",
      title: "Interview follow-up due",
      message: `Follow up on your ${interview.interview_type} for ${interview.job_title} at ${interview.company}.`,
      relatedType: "interview",
      relatedId: interview.id,
      actionUrl: "/interviews",
    });
  }
};

export const generateUserNotifications = async (userId: number) => {
  validUserId(userId);
  await Promise.all([
    generateInterviewNotifications(userId),
    generateSavedJobDeadlineNotifications(userId),
    generateFollowUpNotifications(userId),
  ]);
};