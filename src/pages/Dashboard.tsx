import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import StatCard from "../components/dashboard/StatCard";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

import {
  getDashboardSummary,
  type RecentApplication,
} from "../services/dashboardService";

/* =========================================================
   USER TYPE
========================================================= */

type StoredUser = {
  name?: string;
  email?: string;
};

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
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

  let user:
    StoredUser | null =
    null;

  try {
    user =
      storedUser
        ? JSON.parse(
            storedUser
          )
        : null;
  } catch (error) {
    console.error(
      "Failed to parse stored user:",
      error
    );

    user = null;
  }

  /* =========================================================
     DASHBOARD STATISTICS
  ========================================================= */

  const [
    totalApplications,
    setTotalApplications,
  ] = useState(0);

  const [
    interviews,
    setInterviews,
  ] = useState(0);

  const [
    offers,
    setOffers,
  ] = useState(0);

  const [
    resumes,
    setResumes,
  ] = useState(0);

  /* =========================================================
     RECENT APPLICATIONS
  ========================================================= */

  const [
    recentApplications,
    setRecentApplications,
  ] =
    useState<
      RecentApplication[]
    >([]);

  /* =========================================================
     PAGE STATE
  ========================================================= */

  const [
    loadingDashboard,
    setLoadingDashboard,
  ] = useState(true);

  const [
    dashboardError,
    setDashboardError,
  ] = useState("");

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  useEffect(() => {
    let active = true;

    const loadDashboard =
      async () => {
        try {
          setLoadingDashboard(
            true
          );

          setDashboardError(
            ""
          );

          const data =
            await getDashboardSummary();

          if (!active) {
            return;
          }

          setTotalApplications(
            data.summary
              .totalApplications ??
              0
          );

          setInterviews(
            data.summary
              .interviews ??
              0
          );

          setOffers(
            data.summary
              .offers ??
              0
          );

          setResumes(
            data.summary
              .resumes ??
              0
          );

          setRecentApplications(
            data.recentApplications ??
              []
          );
        } catch (error) {
          console.error(
            "Failed to load dashboard summary:",
            error
          );

          if (!active) {
            return;
          }

          if (
            error instanceof Error
          ) {
            setDashboardError(
              error.message
            );
          } else {
            setDashboardError(
              "Failed to load dashboard."
            );
          }
        } finally {
          if (active) {
            setLoadingDashboard(
              false
            );
          }
        }
      };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

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
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          aria-label="Open menu"
        >
          <span className="text-xl">
            ☰
          </span>
        </button>

        <h1 className="text-xl font-bold text-blue-600">
          CareerFlow
        </h1>

        <div className="h-10 w-10" />

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
          MAIN CONTENT
      ===================================================== */}

      <div className="min-w-0 lg:ml-64">

        <DashboardHeader
          user={
            user
          }
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <div className="mx-auto max-w-7xl">

            {/* =================================================
                ERROR
            ================================================= */}

            {dashboardError && (
              <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                <p className="text-sm text-red-700">
                  {
                    dashboardError
                  }
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setDashboardError(
                      ""
                    )
                  }
                  className="shrink-0 text-sm font-semibold text-red-600 transition hover:text-red-800"
                  aria-label="Dismiss error"
                >
                  ×
                </button>

              </div>
            )}

            {/* =================================================
                WELCOME
            ================================================= */}

            <section className="mb-8">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

                <p className="text-sm font-semibold text-blue-600">
                  Dashboard
                </p>

                <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Welcome back,{" "}
                      {user?.name
                        ?.trim()
                        .split(" ")[0] ||
                        "there"}
                      .
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Keep track of your job search, manage your
                      resumes, and monitor your career progress from
                      one place.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/applications"
                      )
                    }
                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                  >
                    + Add Application
                  </button>

                </div>

              </div>

            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="mb-8">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                  title="Total Applications"
                  value={
                    totalApplications
                  }
                  description="Applications submitted"
                  icon="01"
                  iconClassName="bg-blue-50 text-blue-600"
                />

                <StatCard
                  title="Interviews"
                  value={
                    interviews
                  }
                  description="Interview opportunities"
                  icon="02"
                  iconClassName="bg-amber-50 text-amber-600"
                />

                <StatCard
                  title="Offers"
                  value={
                    offers
                  }
                  description="Job offers received"
                  icon="03"
                  iconClassName="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                  title="Resumes"
                  value={
                    resumes
                  }
                  description="Resume versions created"
                  icon="04"
                  iconClassName="bg-purple-50 text-purple-600"
                />

              </div>

            </section>

            {/* =================================================
                MAIN DASHBOARD GRID
            ================================================= */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

              {/* ===============================================
                  RECENT APPLICATIONS
              =============================================== */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Recent Applications
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Your latest job applications.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/applications"
                      )
                    }
                    className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    View all
                  </button>

                </div>

                {/* =============================================
                    LOADING
                ============================================= */}

                {loadingDashboard ? (
                  <div className="flex min-h-64 items-center justify-center">

                    <div className="text-center">

                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                      <p className="mt-3 text-sm text-slate-500">
                        Loading dashboard...
                      </p>

                    </div>

                  </div>
                ) : recentApplications.length ===
                  0 ? (
                  /* ===========================================
                     EMPTY APPLICATIONS
                  =========================================== */

                  <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl font-semibold text-blue-600">
                      +
                    </div>

                    <h4 className="mt-4 font-semibold text-slate-900">
                      No applications yet
                    </h4>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Add your first job application and start
                      tracking your progress through the hiring
                      process.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/applications"
                        )
                      }
                      className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Add application
                    </button>

                  </div>
                ) : (
                  /* ===========================================
                     APPLICATION LIST
                  =========================================== */

                  <div className="divide-y divide-slate-100">

                    {recentApplications.map(
                      (
                        application
                      ) => (
                        <button
                          type="button"
                          key={
                            application.id
                          }
                          onClick={() =>
                            navigate(
                              "/applications"
                            )
                          }
                          className="flex w-full flex-col gap-3 px-6 py-5 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                        >

                          <div className="min-w-0">

                            <p className="break-words font-semibold text-slate-900">
                              {
                                application.job_title
                              }
                            </p>

                            <p className="mt-1 break-words text-sm text-slate-500">
                              {
                                application.company
                              }
                            </p>

                            {application.location && (
                              <p className="mt-1 break-words text-xs text-slate-400">
                                {
                                  application.location
                                }
                              </p>
                            )}

                          </div>

                          <span
                            className={`
                              w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold
                              ${
                                application.status ===
                                "Offer"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : application.status ===
                                    "Rejected"
                                  ? "bg-red-50 text-red-700"
                                  : application.status.includes(
                                      "Interview"
                                    )
                                  ? "bg-amber-50 text-amber-700"
                                  : application.status ===
                                    "Applied"
                                  ? "bg-blue-50 text-blue-700"
                                  : application.status ===
                                    "Screening"
                                  ? "bg-violet-50 text-violet-700"
                                  : "bg-slate-100 text-slate-600"
                              }
                            `}
                          >
                            {
                              application.status
                            }
                          </span>

                        </button>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* ===============================================
                  QUICK ACTIONS
              =============================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="font-bold text-slate-900">
                  Quick Actions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Common CareerFlow tasks.
                </p>

                <div className="mt-5 space-y-3">

                  {/* CREATE RESUME */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/resumes/new"
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                  >

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Create Resume
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Build a new resume
                      </p>

                    </div>

                    <span className="text-slate-400">
                      →
                    </span>

                  </button>

                  {/* ADD APPLICATION */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/applications"
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                  >

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Add Application
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Track a job application
                      </p>

                    </div>

                    <span className="text-slate-400">
                      →
                    </span>

                  </button>

                  {/* SAVED JOBS */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/saved-jobs"
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                  >

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Saved Jobs
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Review opportunities to apply for
                      </p>

                    </div>

                    <span className="text-slate-400">
                      →
                    </span>

                  </button>

                  {/* UPDATE PROFILE */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/profile"
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                  >

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Update Profile
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Manage career information
                      </p>

                    </div>

                    <span className="text-slate-400">
                      →
                    </span>

                  </button>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;