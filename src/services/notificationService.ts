import { apiRequest } from "./api";

/* =========================================================
   NOTIFICATION TYPE
========================================================= */

export type Notification = {
  id: number;

  type: string;

  title: string;

  message: string;

  related_type: string | null;

  related_id: number | null;

  is_read: boolean;

  action_url: string | null;

  created_at: string;

  updated_at: string;
};

/* =========================================================
   RESPONSE TYPES
========================================================= */

export type NotificationsResponse = {
  message: string;

  notifications: Notification[];
};

export type UnreadNotificationCountResponse = {
  message: string;

  unreadCount: number;
};

export type NotificationActionResponse = {
  message: string;

  updated?: number;
};

/* =========================================================
   GET ALL NOTIFICATIONS
========================================================= */

export const getNotifications =
  async (): Promise<NotificationsResponse> => {
    return apiRequest(
      "/notifications",
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   GET UNREAD COUNT
========================================================= */

export const getUnreadNotificationCount =
  async (): Promise<UnreadNotificationCountResponse> => {
    return apiRequest(
      "/notifications/unread-count",
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   MARK ONE AS READ
========================================================= */

export const markNotificationAsRead =
  async (
    id: number
  ): Promise<NotificationActionResponse> => {
    return apiRequest(
      `/notifications/${id}/read`,
      {
        method: "PUT",
      }
    );
  };

/* =========================================================
   MARK ALL AS READ
========================================================= */

export const markAllNotificationsAsRead =
  async (): Promise<NotificationActionResponse> => {
    return apiRequest(
      "/notifications/read-all",
      {
        method: "PUT",
      }
    );
  };

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

export const deleteNotification =
  async (
    id: number
  ): Promise<NotificationActionResponse> => {
    return apiRequest(
      `/notifications/${id}`,
      {
        method: "DELETE",
      }
    );
  };