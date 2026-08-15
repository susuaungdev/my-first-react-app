import type { ResultSetHeader } from "mysql2";
import db from "../config/db";

export type CreateNotificationInput = {
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedType?: string | null;
  relatedId?: number | null;
  actionUrl?: string | null;
};

const clean = (value: string, label: string, max: number) => {
  const result = value.trim();
  if (!result) throw new Error(`${label} is required.`);
  if (result.length > max) throw new Error(`${label} is too long.`);
  return result;
};

export const createNotification = async (input: CreateNotificationInput) => {
  if (!Number.isInteger(input.userId) || input.userId <= 0) {
    throw new Error("Invalid notification user ID.");
  }

  const type = clean(input.type, "Notification type", 100);
  const title = clean(input.title, "Notification title", 255);
  const message = clean(input.message, "Notification message", 5000);
  const relatedType = input.relatedType?.trim() || null;
  const relatedId = input.relatedId ?? null;
  const actionUrl = input.actionUrl?.trim() || null;

  if (relatedId !== null && (!Number.isInteger(relatedId) || relatedId <= 0)) {
    throw new Error("Invalid related notification ID.");
  }

  if (actionUrl && (!actionUrl.startsWith("/") || actionUrl.startsWith("//"))) {
    throw new Error("Invalid notification action URL.");
  }

  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO notifications
      (user_id, type, title, message, related_type, related_id, is_read, action_url)
     VALUES (?, ?, ?, ?, ?, ?, FALSE, ?)
     ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
    [input.userId, type, title, message, relatedType, relatedId, actionUrl]
  );

  return {
    id: result.insertId,
    userId: input.userId,
    type,
    title,
    message,
    relatedType,
    relatedId,
    isRead: false,
    actionUrl,
    created: result.affectedRows === 1,
  };
};