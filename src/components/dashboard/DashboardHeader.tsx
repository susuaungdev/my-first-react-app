import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "../../services/notificationService";

/* =========================================================
   PROPS
========================================================= */

type DashboardHeaderProps = {
  user: {
    name?: string;
    email?: string;
  } | null;
};

/* =========================================================
   DASHBOARD HEADER
========================================================= */

function DashboardHeader({
  user,
}: DashboardHeaderProps) {
  const navigate =
    useNavigate();

  const dropdownRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* =========================================================
     STATE
  ========================================================= */

  const [
    notifications,
    setNotifications,
  ] = useState<
    Notification[]
  >([]);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     UNREAD COUNT
  ========================================================= */

  const unreadCount =
    notifications.filter(
      (
        notification
      ) =>
        !notification.is_read
    ).length;

  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */

  const loadNotifications =
    async () => {
      try {
        setLoading(
          true
        );

        setError("");

        const response =
          await getNotifications();

        setNotifications(
          response.notifications ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );

        setError(
          "Failed to load notifications."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadNotifications();
  }, []);

  /* =========================================================
     CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside =
      (
        event:
          MouseEvent
      ) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target as Node
          )
        ) {
          setNotificationOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     OPEN / CLOSE NOTIFICATIONS
  ========================================================= */

  const handleNotificationToggle =
    () => {
      setNotificationOpen(
        (
          current
        ) =>
          !current
      );
    };

  /* =========================================================
     MARK ONE AS READ
  ========================================================= */

  const handleNotificationClick =
    async (
      notification:
        Notification
    ) => {
      try {
        if (
          !notification.is_read
        ) {
          await markNotificationAsRead(
            notification.id
          );

          setNotifications(
            (
              current
            ) =>
              current.map(
                (
                  item
                ) =>
                  item.id ===
                  notification.id
                    ? {
                        ...item,

                        is_read:
                          true,
                      }
                    : item
              )
          );
        }

        setNotificationOpen(
          false
        );

        if (
          notification.action_url
        ) {
          navigate(
            notification.action_url
          );
        }
      } catch (error) {
        console.error(
          "Failed to mark notification as read:",
          error
        );

        setError(
          "Failed to update notification."
        );
      }
    };

  /* =========================================================
     MARK ALL AS READ
  ========================================================= */

  const handleMarkAllAsRead =
    async () => {
      if (
        unreadCount ===
        0
      ) {
        return;
      }

      try {
        setError("");

        await markAllNotificationsAsRead();

        setNotifications(
          (
            current
          ) =>
            current.map(
              (
                notification
              ) => ({
                ...notification,

                is_read:
                  true,
              })
            )
        );
      } catch (error) {
        console.error(
          "Failed to mark all notifications as read:",
          error
        );

        setError(
          "Failed to mark notifications as read."
        );
      }
    };

  /* =========================================================
     DELETE NOTIFICATION
  ========================================================= */

  const handleDeleteNotification =
    async (
      event:
        React.MouseEvent<HTMLButtonElement>,
      id: number
    ) => {
      event.stopPropagation();

      try {
        setError("");

        await deleteNotification(
          id
        );

        setNotifications(
          (
            current
          ) =>
            current.filter(
              (
                notification
              ) =>
                notification.id !==
                id
            )
        );
      } catch (error) {
        console.error(
          "Failed to delete notification:",
          error
        );

        setError(
          "Failed to delete notification."
        );
      }
    };

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  const formatNotificationTime =
    (
      value:
        string
    ) => {
      const date =
        new Date(
          value
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }

      const now =
        new Date();

      const difference =
        now.getTime() -
        date.getTime();

      const minutes =
        Math.floor(
          difference /
            60000
        );

      const hours =
        Math.floor(
          minutes /
            60
        );

      const days =
        Math.floor(
          hours /
            24
        );

      if (
        minutes <
        1
      ) {
        return "Just now";
      }

      if (
        minutes <
        60
      ) {
        return `${minutes}m ago`;
      }

      if (
        hours <
        24
      ) {
        return `${hours}h ago`;
      }

      if (
        days <
        7
      ) {
        return `${days}d ago`;
      }

      return date.toLocaleDateString(
        undefined,
        {
          month:
            "short",

          day:
            "numeric",
        }
      );
    };

  /* =========================================================
     NOTIFICATION ICON
  ========================================================= */

  const getNotificationIcon =
    (
      type:
        string
    ) => {
      if (
        type.includes(
          "interview"
        )
      ) {
        return (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2"
            />

            <path d="M8 3v4" />

            <path d="M16 3v4" />

            <path d="M3 10h18" />
          </svg>
        );
      }

      if (
        type.includes(
          "saved_job"
        ) ||
        type.includes(
          "deadline"
        )
      ) {
        return (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
          </svg>
        );
      }

      if (
        type.includes(
          "application"
        )
      ) {
        return (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="3"
              y="6"
              width="18"
              height="14"
              rx="2"
            />

            <path d="M8 6V4h8v2" />

            <path d="M3 11h18" />
          </svg>
        );
      }

      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

          <path d="M10 21h4" />
        </svg>
      );
    };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">

      {/* =====================================================
          LEFT
      ===================================================== */}

      <div>

        <p className="text-sm font-medium text-slate-500">
          Career workspace
        </p>

      </div>

      {/* =====================================================
          RIGHT
      ===================================================== */}

      <div className="flex items-center gap-4">

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <div
          ref={
            dropdownRef
          }
          className="relative"
        >

          {/* BELL */}

          <button
            type="button"
            onClick={
              handleNotificationToggle
            }
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              notificationOpen
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
            aria-label="Notifications"
            aria-expanded={
              notificationOpen
            }
          >

            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

              <path d="M10 21h4" />
            </svg>

            {/* UNREAD BADGE */}

            {unreadCount >
              0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount >
                99
                  ? "99+"
                  : unreadCount}
              </span>
            )}

          </button>

          {/* =================================================
              DROPDOWN
          ================================================= */}

          {notificationOpen && (
            <div className="absolute right-0 top-12 z-[100] w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-base font-bold text-slate-900">
                      Notifications
                    </h2>

                    {unreadCount >
                      0 && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                        {
                          unreadCount
                        }{" "}
                        new
                      </span>
                    )}

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Stay updated on your job search.
                  </p>

                </div>

                {unreadCount >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      handleMarkAllAsRead
                    }
                    className="shrink-0 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}

              </div>

              {/* ===============================================
                  ERROR
              =============================================== */}

              {error && (
                <div className="border-b border-red-100 bg-red-50 px-5 py-3">

                  <p className="text-xs font-medium text-red-700">
                    {error}
                  </p>

                </div>
              )}

              {/* ===============================================
                  CONTENT
              =============================================== */}

              <div className="max-h-[430px] overflow-y-auto">

                {/* LOADING */}

                {loading && (
                  <div className="flex min-h-48 items-center justify-center">

                    <div className="text-center">

                      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />

                      <p className="mt-3 text-xs font-medium text-slate-500">
                        Loading notifications...
                      </p>

                    </div>

                  </div>
                )}

                {/* EMPTY */}

                {!loading &&
                  notifications.length ===
                    0 && (
                    <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

                          <path d="M10 21h4" />
                        </svg>

                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-800">
                        No notifications
                      </p>

                      <p className="mt-1 max-w-56 text-xs leading-5 text-slate-500">
                        Interview reminders and important CareerFlow updates
                        will appear here.
                      </p>

                    </div>
                  )}

                {/* ===============================================
                    NOTIFICATION LIST
                =============================================== */}

                {!loading &&
                  notifications.length >
                    0 && (
                    <div>

                      {notifications.map(
                        (
                          notification
                        ) => (
                          <div
                            key={
                              notification.id
                            }
                            role="button"
                            tabIndex={
                              0
                            }
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            onKeyDown={(
                              event
                            ) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key ===
                                  " "
                              ) {
                                event.preventDefault();

                                handleNotificationClick(
                                  notification
                                );
                              }
                            }}
                            className={`group relative cursor-pointer border-b border-slate-100 px-5 py-4 transition last:border-b-0 ${
                              notification.is_read
                                ? "bg-white hover:bg-slate-50"
                                : "bg-blue-50/50 hover:bg-blue-50"
                            }`}
                          >

                            <div className="flex items-start gap-3">

                              {/* ICON */}

                              <div
                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                  notification.is_read
                                    ? "bg-slate-100 text-slate-500"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {getNotificationIcon(
                                  notification.type
                                )}
                              </div>

                              {/* CONTENT */}

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-3">

                                  <div className="min-w-0">

                                    <div className="flex items-center gap-2">

                                      <p
                                        className={`break-words text-sm ${
                                          notification.is_read
                                            ? "font-semibold text-slate-800"
                                            : "font-bold text-slate-900"
                                        }`}
                                      >
                                        {
                                          notification.title
                                        }
                                      </p>

                                      {!notification.is_read && (
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                      )}

                                    </div>

                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                      {
                                        notification.message
                                      }
                                    </p>

                                  </div>

                                  {/* DELETE */}

                                  <button
                                    type="button"
                                    onClick={(
                                      event
                                    ) =>
                                      handleDeleteNotification(
                                        event,
                                        notification.id
                                      )
                                    }
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                    aria-label="Delete notification"
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 6h18" />

                                      <path d="M8 6V4h8v2" />

                                      <path d="M19 6l-1 14H6L5 6" />

                                      <path d="M10 11v5" />

                                      <path d="M14 11v5" />
                                    </svg>
                                  </button>

                                </div>

                                <p className="mt-2 text-[11px] font-medium text-slate-400">
                                  {formatNotificationTime(
                                    notification.created_at
                                  )}
                                </p>

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

              </div>

            </div>
          )}

        </div>

        {/* ===================================================
            DIVIDER
        =================================================== */}

        <div className="h-8 w-px bg-slate-200" />

        {/* ===================================================
            USER INFO
        =================================================== */}

        <div className="text-right">

          <p className="max-w-48 truncate text-sm font-semibold text-slate-900">
            {user?.name ||
              "CareerFlow User"}
          </p>

          <p className="max-w-48 truncate text-xs text-slate-500">
            {user?.email ||
              "user@example.com"}
          </p>

        </div>

        {/* ===================================================
            USER AVATAR
        =================================================== */}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
          {user?.name
            ? user.name
                .charAt(0)
                .toUpperCase()
            : "U"}
        </div>

      </div>

    </header>
  );
}

export default DashboardHeader;