import {
  useLocation,
  useNavigate,
} from "react-router-dom";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;

  user: {
    name?: string;
    email?: string;
  } | null;

  onLogout: () => void;
};

function Sidebar({
  isOpen,
  onClose,
  user,
  onLogout,
}: SidebarProps) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  /* =========================================================
     ACTIVE NAVIGATION
  ========================================================= */

  const isActive = (
    path: string
  ) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };

  /* =========================================================
     NAVIGATION STYLES
  ========================================================= */

  const navClass = (
    path: string
  ) => {
    return `
      group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5
      text-left text-sm transition

      ${
        isActive(path)
          ? "bg-blue-50 font-semibold text-blue-700"
          : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }
    `;
  };

  const iconClass = (
    path: string
  ) => {
    return `
      flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition

      ${
        isActive(path)
          ? "bg-blue-100 text-blue-700"
          : "bg-slate-50 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-800"
      }
    `;
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNavigate = (
    path: string
  ) => {
    navigate(
      path
    );

    onClose();
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
          overflow-hidden border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:translate-x-0

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/dashboard"
              )
            }
            className="text-left"
          >
            <h1 className="text-xl font-bold tracking-tight text-blue-600">
              CareerFlow
            </h1>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close menu"
          >
            ×
          </button>

        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="min-h-0 flex-1 space-y-1 overflow-hidden px-3 py-4">

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/dashboard"
              )
            }
            className={
              navClass(
                "/dashboard"
              )
            }
          >
            <span
              className={
                iconClass(
                  "/dashboard"
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                />

                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                />

                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1.5"
                />

                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                  rx="1.5"
                />
              </svg>
            </span>

            Dashboard
          </button>

          {/* =================================================
              RESUMES
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/resumes"
              )
            }
            className={
              navClass(
                "/resumes"
              )
            }
          >
            <span
              className={
                iconClass(
                  "/resumes"
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2h8l4 4v16H6z" />

                <path d="M14 2v5h5" />

                <path d="M9 12h6" />

                <path d="M9 16h6" />
              </svg>
            </span>

            Resumes
          </button>

          {/* =================================================
              JOB APPLICATIONS
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/applications"
              )
            }
            className={
              navClass(
                "/applications"
              )
            }
          >
            <span
              className={
                iconClass(
                  "/applications"
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
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
            </span>

            Job Applications
          </button>

          {/* =================================================
              INTERVIEWS
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/interviews"
              )
            }
            className={
              navClass(
                "/interviews"
              )
            }
          >
            <span
              className={
                iconClass(
                  "/interviews"
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
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

                <path d="M16 3v4" />

                <path d="M8 3v4" />

                <path d="M3 10h18" />

                <circle
                  cx="8"
                  cy="15"
                  r="1"
                />

                <path d="M12 15h5" />
              </svg>
            </span>

            Interviews
          </button>

          {/* =================================================
              SAVED JOBS
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/saved-jobs"
              )
            }
            className={
              navClass(
                "/saved-jobs"
              )
            }
          >
            <span
              className={
                iconClass(
                  "/saved-jobs"
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
              </svg>
            </span>

            Saved Jobs
          </button>

          {/* =================================================
              ANALYTICS
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/analytics"
              )
            }
            className={
              navClass(
                "/analytics"
              )
            }
          >
            <span
              className={
                iconClass(
                  "/analytics"
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 20V10" />

                <path d="M10 20V4" />

                <path d="M16 20v-7" />

                <path d="M22 20H2" />
              </svg>
            </span>

            Analytics
          </button>

          {/* =================================================
              PROFILE
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/profile"
              )
            }
            className={
              navClass(
                "/profile"
              )
            }
          >
            <span
              className={
                iconClass(
                  "/profile"
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </span>

            Profile
          </button>

        </nav>

        {/* ===================================================
            USER SECTION
        =================================================== */}

        <div className="shrink-0 border-t border-slate-200 px-3 pb-3 pt-3">

          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">

            {/* PROFILE INITIAL */}

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            {/* USER INFO */}

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name ||
                  "CareerFlow User"}
              </p>

              <p className="truncate text-[11px] text-slate-500">
                {user?.email ||
                  "user@example.com"}
              </p>

            </div>

          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={
              onLogout
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Logout
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;