import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar";

import DashboardHeader from "../components/dashboard/DashboardHeader";

import {
  getResumes,
  deleteResume,
  type Resume,
} from "../services/resumeService";

/* =========================================================
   RESUMES PAGE
========================================================= */

function Resumes() {
  const navigate =
    useNavigate();

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  /* =========================================================
     USER
  ========================================================= */

  const storedUser =
    localStorage.getItem(
      "user"
    );

  let user: {
    name?: string;
    email?: string;
  } | null = null;

  try {
    user =
      storedUser
        ? JSON.parse(
            storedUser
          )
        : null;
  } catch {
    user = null;
  }

  /* =========================================================
     RESUME DATA
  ========================================================= */

  const [
    resumes,
    setResumes,
  ] =
    useState<
      Resume[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      number | null
    >(null);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate(
        "/login"
      );
    };

  /* =========================================================
     LOAD RESUMES
  ========================================================= */

  const loadResumes =
    async () => {
      try {
        setLoading(
          true
        );

        setError("");

        const data =
          await getResumes();

        setResumes(
          data.resumes ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load resumes:",
          error
        );

        if (
          error instanceof
          Error
        ) {
          setError(
            error.message
          );
        } else {
          setError(
            "Failed to load resumes."
          );
        }
      } finally {
        setLoading(
          false
        );
      }
    };

  useEffect(() => {
    loadResumes();
  }, []);

  /* =========================================================
     DELETE RESUME
  ========================================================= */

  const handleDelete =
    async (
      id: number
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this resume?"
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        setDeletingId(
          id
        );

        setError("");

        await deleteResume(
          id
        );

        /*
         * Remove only the deleted resume from local state.
         * This avoids reloading the entire page.
         */

        setResumes(
          (
            currentResumes
          ) =>
            currentResumes.filter(
              (
                resume
              ) =>
                resume.id !==
                id
            )
        );
      } catch (error) {
        console.error(
          "Failed to delete resume:",
          error
        );

        if (
          error instanceof
          Error
        ) {
          setError(
            error.message
          );
        } else {
          setError(
            "Failed to delete resume."
          );
        }
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (
    date: string
  ) => {
    const parsedDate =
      new Date(
        date
      );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
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
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

        <button
          type="button"
          onClick={() =>
            setSidebarOpen(
              true
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          aria-label="Open menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>

        <h1 className="text-lg font-bold tracking-tight text-blue-600">
          CareerFlow
        </h1>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {user?.name
            ? user.name
                .charAt(0)
                .toUpperCase()
            : "U"}
        </div>

      </header>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        isOpen={
          sidebarOpen
        }
        onClose={() =>
          setSidebarOpen(
            false
          )
        }
        user={
          user
        }
        onLogout={
          handleLogout
        }
      />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="min-w-0 lg:ml-64">

        {/* ===================================================
            DASHBOARD HEADER
        =================================================== */}

        <DashboardHeader
          user={
            user
          }
        />

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* =================================================
              PAGE HEADING
          ================================================= */}

          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div className="max-w-2xl">

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
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

                </div>

                <p className="text-sm font-semibold text-blue-600">
                  Resume workspace
                </p>

              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Your resumes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create, manage, and maintain professional resume versions
                tailored to different roles and opportunities.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/resumes/new"
                )
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14" />

                <path d="M5 12h14" />
              </svg>

              Create Resume
            </button>

          </div>

          {/* =================================================
              RESUME SUMMARY
          ================================================= */}

          {!loading &&
            resumes.length >
              0 && (
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-sm font-semibold text-slate-500">
                        Total resumes
                      </p>

                      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {
                          resumes.length
                        }
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
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

                    </div>

                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Resume versions currently saved in CareerFlow.
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-sm font-semibold text-slate-500">
                        Latest update
                      </p>

                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {resumes.length >
                        0
                          ? formatDate(
                              resumes[0]
                                .updated_at
                            )
                          : "No activity"}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                        />

                        <path d="M12 7v5l3 2" />
                      </svg>

                    </div>

                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Most recent resume activity in your workspace.
                  </p>

                </div>

              </div>
            )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                  !
                </div>

                <div>

                  <p className="text-sm font-semibold text-red-800">
                    Something went wrong
                  </p>

                  <p className="mt-0.5 text-sm text-red-700">
                    {error}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="shrink-0 text-lg font-semibold text-red-500 transition hover:text-red-700"
                aria-label="Close error"
              >
                ×
              </button>

            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="text-center">

                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading resumes
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Getting your CareerFlow resume workspace ready...
                </p>

              </div>

            </div>
          ) : resumes.length ===
            0 ? (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
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

              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No resumes yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first professional resume and start building
                versions tailored to different opportunities.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/resumes/new"
                  )
                }
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14" />

                  <path d="M5 12h14" />
                </svg>

                Create your first resume
              </button>

            </div>
          ) : (
            /* =================================================
               RESUME GRID
            ================================================= */

            <section>

              <div className="mb-4 flex items-end justify-between gap-4">

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Resume library
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage all of your saved resume versions.
                  </p>

                </div>

                <p className="hidden text-xs font-medium text-slate-400 sm:block">
                  {
                    resumes.length
                  }{" "}
                  resume
                  {resumes.length ===
                  1
                    ? ""
                    : "s"}
                </p>

              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {resumes.map(
                  (
                    resume
                  ) => (
                    <article
                      key={
                        resume.id
                      }
                      className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >

                      {/* ===========================================
                          ICON
                      =========================================== */}

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">

                          <svg
                            viewBox="0 0 24 24"
                            className="h-6 w-6"
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

                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                          Resume
                        </span>

                      </div>

                      {/* ===========================================
                          TITLE
                      =========================================== */}

                      <div className="mt-5">

                        <h2 className="break-words text-lg font-bold text-slate-900">
                          {
                            resume.title
                          }
                        </h2>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                          {resume.summary ||
                            "No professional summary added yet."}
                        </p>

                      </div>

                      {/* ===========================================
                          META
                      =========================================== */}

                      <div className="mt-5 space-y-2">

                        {resume.location && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">

                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

                              <circle
                                cx="12"
                                cy="10"
                                r="2"
                              />
                            </svg>

                            <span className="truncate">
                              {
                                resume.location
                              }
                            </span>

                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-400">

                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                            />

                            <path d="M12 7v5l3 2" />
                          </svg>

                          <span>
                            Updated{" "}
                            {
                              formatDate(
                                resume.updated_at
                              )
                            }
                          </span>

                        </div>

                      </div>

                      {/* ===========================================
                          ACTIONS
                      =========================================== */}

                      <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/resumes/${resume.id}`
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/resumes/${resume.id}/edit`
                            )
                          }
                          className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              resume.id
                            )
                          }
                          disabled={
                            deletingId ===
                            resume.id
                          }
                          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId ===
                          resume.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </article>
                  )
                )}

              </div>

            </section>
          )}

        </main>

      </div>

    </div>
  );
}

export default Resumes;