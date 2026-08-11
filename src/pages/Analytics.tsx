import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar";

import DashboardHeader from "../components/dashboard/DashboardHeader";

import {
  getAnalyticsOverview,
  type AnalyticsOverviewResponse,
  type AnalyticsRecentApplication,
  type AnalyticsUpcomingInterview,
} from "../services/analyticsService";

/* =========================================================
   ANALYTICS PAGE
========================================================= */

function Analytics() {
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
     DATA
  ========================================================= */

  const [
    analytics,
    setAnalytics,
  ] =
    useState<
      AnalyticsOverviewResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /* =========================================================
     LOAD ANALYTICS
  ========================================================= */

  const loadAnalytics =
    async (
      background = false
    ) => {
      try {
        if (
          background
        ) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }

        setError("");

        const data =
          await getAnalyticsOverview();

        setAnalytics(
          data
        );
      } catch (error) {
        console.error(
          "Failed to load analytics:",
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
            "Failed to load analytics."
          );
        }
      } finally {
        setLoading(
          false
        );

        setRefreshing(
          false
        );
      }
    };

  useEffect(() => {
    loadAnalytics();
  }, []);

  /* =========================================================
     FORMAT DATE TIME
  ========================================================= */

  const formatDateTime = (
    value:
      string | null
  ) => {
    if (!value) {
      return "Not set";
    }

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString(
      undefined,
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    );
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (
    value:
      string | null
  ) => {
    if (!value) {
      return "Not set";
    }

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
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
     FORMAT MONTH
  ========================================================= */

  const formatMonth = (
    month:
      string
  ) => {
    const date =
      new Date(
        `${month}-01T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return month;
    }

    return date.toLocaleDateString(
      undefined,
      {
        month:
          "short",

        year:
          "numeric",
      }
    );
  };

  /* =========================================================
     APPLICATION STATUS STYLE
  ========================================================= */

  const getApplicationStatusClasses =
    (
      status:
        string
    ) => {
      if (
        status ===
        "Offer"
      ) {
        return "bg-emerald-50 text-emerald-700";
      }

      if (
        status ===
        "Rejected"
      ) {
        return "bg-red-50 text-red-700";
      }

      if (
        status ===
        "Withdrawn"
      ) {
        return "bg-slate-100 text-slate-600";
      }

      if (
        status.includes(
          "Interview"
        )
      ) {
        return "bg-amber-50 text-amber-700";
      }

      if (
        status ===
        "Screening"
      ) {
        return "bg-violet-50 text-violet-700";
      }

      if (
        status ===
        "Applied"
      ) {
        return "bg-blue-50 text-blue-700";
      }

      return "bg-slate-100 text-slate-600";
    };

  /* =========================================================
     INTERVIEW RESULT STYLE
  ========================================================= */

  const getInterviewResultClasses =
    (
      result:
        string
    ) => {
      if (
        result ===
        "Passed"
      ) {
        return "bg-emerald-50 text-emerald-700";
      }

      if (
        result ===
        "Failed"
      ) {
        return "bg-red-50 text-red-700";
      }

      if (
        result ===
        "Offer"
      ) {
        return "bg-green-100 text-green-800";
      }

      if (
        result ===
        "Cancelled"
      ) {
        return "bg-slate-100 text-slate-600";
      }

      return "bg-amber-50 text-amber-700";
    };

  /* =========================================================
     APPLICATION STATUS MAX
  ========================================================= */

  const maxApplicationStatusCount =
    useMemo(() => {
      if (
        !analytics ||
        analytics
          .applicationStatusDistribution
          .length ===
          0
      ) {
        return 1;
      }

      return Math.max(
        ...analytics
          .applicationStatusDistribution
          .map(
            (
              item
            ) =>
              item.count
          ),
        1
      );
    }, [analytics]);

  /* =========================================================
     INTERVIEW RESULT MAX
  ========================================================= */

  const maxInterviewResultCount =
    useMemo(() => {
      if (
        !analytics ||
        analytics
          .interviewResultDistribution
          .length ===
          0
      ) {
        return 1;
      }

      return Math.max(
        ...analytics
          .interviewResultDistribution
          .map(
            (
              item
            ) =>
              item.count
          ),
        1
      );
    }, [analytics]);

  /* =========================================================
     MONTH MAX
  ========================================================= */

  const maxMonthlyApplications =
    useMemo(() => {
      if (
        !analytics ||
        analytics
          .applicationsByMonth
          .length ===
          0
      ) {
        return 1;
      }

      return Math.max(
        ...analytics
          .applicationsByMonth
          .map(
            (
              item
            ) =>
              item.count
          ),
        1
      );
    }, [analytics]);

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
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
            DESKTOP AREA
        ===================================================== */}

        <div className="min-w-0 lg:ml-64">

          {/* ===================================================
              DASHBOARD STYLE HEADER
          =================================================== */}

          <DashboardHeader
            user={
              user
            }
          />

          {/* ===================================================
              PAGE CONTENT
          =================================================== */}

          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

              <div className="max-w-3xl">

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
                      <path d="M4 20V10" />

                      <path d="M10 20V4" />

                      <path d="M16 20v-7" />

                      <path d="M22 20H2" />
                    </svg>

                  </div>

                  <p className="text-sm font-semibold text-blue-600">
                    Performance overview
                  </p>

                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Analytics
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Track your application pipeline,
                  interview performance, saved jobs,
                  hiring outcomes, and overall job
                  search progress.
                </p>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/applications"
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  View Applications
                </button>

                <button
                  type="button"
                  onClick={() =>
                    loadAnalytics(
                      true
                    )
                  }
                  disabled={
                    loading ||
                    refreshing
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6v5h-5" />

                    <path d="M4 18v-5h5" />

                    <path d="M18.5 9a7 7 0 0 0-11.7-2.6L4 11" />

                    <path d="M5.5 15a7 7 0 0 0 11.7 2.6L20 13" />
                  </svg>

                  {refreshing
                    ? "Refreshing..."
                    : "Refresh Analytics"}
                </button>

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    !
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-red-800">
                      Analytics could not be loaded
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
                  className="shrink-0 text-lg font-semibold text-red-500 hover:text-red-700"
                >
                  ×
                </button>

              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="mt-8 flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="text-center">

                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Loading analytics
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Calculating your CareerFlow performance...
                  </p>

                </div>

              </div>
            )}

            {/* =================================================
                ANALYTICS
            ================================================= */}

            {!loading &&
              analytics && (
                <>
                  {/* =============================================
                      MAIN STATS
                  ============================================= */}

                  <section className="mt-8">

                    <SectionTitle
                      title="Overview"
                      description="Your most important CareerFlow metrics at a glance."
                    />

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                      <MetricCard
                        title="Applications"
                        value={
                          analytics
                            .applications
                            .total
                        }
                        description="Total applications tracked"
                        icon={
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
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
                          </svg>
                        }
                      />

                      <MetricCard
                        title="Interviews"
                        value={
                          analytics
                            .interviews
                            .total
                        }
                        description="Interview rounds tracked"
                        icon={
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
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
                        }
                      />

                      <MetricCard
                        title="Offers"
                        value={
                          analytics
                            .applications
                            .offers
                        }
                        description="Applications reaching offer"
                        icon={
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        }
                      />

                      <MetricCard
                        title="Saved Jobs"
                        value={
                          analytics
                            .savedJobs
                            .total
                        }
                        description="Opportunities waiting"
                        icon={
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
                          </svg>
                        }
                      />

                    </div>

                  </section>

                  {/* =============================================
                      PERFORMANCE RATES
                  ============================================= */}

                  <section className="mt-8">

                    <SectionTitle
                      title="Performance rates"
                      description="How your applications are progressing through the hiring process."
                    />

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">

                      <RateCard
                        title="Interview rate"
                        value={
                          analytics
                            .rates
                            .interviewRate
                        }
                        description="Applications currently reaching an interview stage"
                      />

                      <RateCard
                        title="Offer rate"
                        value={
                          analytics
                            .rates
                            .offerRate
                        }
                        description="Applications currently resulting in an offer"
                      />

                      <RateCard
                        title="Rejection rate"
                        value={
                          analytics
                            .rates
                            .rejectionRate
                        }
                        description="Applications currently marked as rejected"
                      />

                    </div>

                  </section>

                  {/* =============================================
                      PIPELINE
                  ============================================= */}

                  <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                    <SectionTitle
                      title="Application pipeline"
                      description="Current applications across every CareerFlow stage."
                    />

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">

                      <PipelineItem
                        label="Saved"
                        value={
                          analytics
                            .applications
                            .saved
                        }
                      />

                      <PipelineItem
                        label="Applied"
                        value={
                          analytics
                            .applications
                            .applied
                        }
                      />

                      <PipelineItem
                        label="Screening"
                        value={
                          analytics
                            .applications
                            .screening
                        }
                      />

                      <PipelineItem
                        label="Interview"
                        value={
                          analytics
                            .applications
                            .interview
                        }
                      />

                      <PipelineItem
                        label="Offer"
                        value={
                          analytics
                            .applications
                            .offers
                        }
                      />

                      <PipelineItem
                        label="Rejected"
                        value={
                          analytics
                            .applications
                            .rejected
                        }
                      />

                      <PipelineItem
                        label="Withdrawn"
                        value={
                          analytics
                            .applications
                            .withdrawn
                        }
                      />

                      <PipelineItem
                        label="Total"
                        value={
                          analytics
                            .applications
                            .total
                        }
                        strong
                      />

                    </div>

                  </section>

                  {/* =============================================
                      STATUS DISTRIBUTION + INTERVIEW OUTCOME
                  ============================================= */}

                  <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

                    {/* APPLICATION STATUS */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                      <SectionTitle
                        title="Application status"
                        description="Distribution of your current application pipeline."
                      />

                      {analytics
                        .applicationStatusDistribution
                        .length ===
                      0 ? (
                        <EmptyState
                          text="No application data available yet."
                        />
                      ) : (
                        <div className="mt-6 space-y-5">

                          {analytics
                            .applicationStatusDistribution
                            .map(
                              (
                                item
                              ) => {
                                const width =
                                  (
                                    item.count /
                                    maxApplicationStatusCount
                                  ) *
                                  100;

                                return (
                                  <div
                                    key={
                                      item.status
                                    }
                                  >

                                    <div className="mb-2 flex items-center justify-between gap-3">

                                      <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getApplicationStatusClasses(
                                          item.status
                                        )}`}
                                      >
                                        {
                                          item.status
                                        }
                                      </span>

                                      <span className="text-sm font-bold text-slate-800">
                                        {
                                          item.count
                                        }
                                      </span>

                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                      <div
                                        className="h-full rounded-full bg-blue-600"
                                        style={{
                                          width:
                                            `${Math.max(
                                              width,
                                              3
                                            )}%`,
                                        }}
                                      />

                                    </div>

                                  </div>
                                );
                              }
                            )}

                        </div>
                      )}

                    </section>

                    {/* INTERVIEW OUTCOMES */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                      <SectionTitle
                        title="Interview outcomes"
                        description="Results across your recorded interview rounds."
                      />

                      {analytics
                        .interviewResultDistribution
                        .length ===
                      0 ? (
                        <EmptyState
                          text="No interview results available yet."
                        />
                      ) : (
                        <div className="mt-6 space-y-5">

                          {analytics
                            .interviewResultDistribution
                            .map(
                              (
                                item
                              ) => {
                                const width =
                                  (
                                    item.count /
                                    maxInterviewResultCount
                                  ) *
                                  100;

                                return (
                                  <div
                                    key={
                                      item.result
                                    }
                                  >

                                    <div className="mb-2 flex items-center justify-between gap-3">

                                      <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getInterviewResultClasses(
                                          item.result
                                        )}`}
                                      >
                                        {
                                          item.result
                                        }
                                      </span>

                                      <span className="text-sm font-bold text-slate-800">
                                        {
                                          item.count
                                        }
                                      </span>

                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                      <div
                                        className="h-full rounded-full bg-slate-700"
                                        style={{
                                          width:
                                            `${Math.max(
                                              width,
                                              3
                                            )}%`,
                                        }}
                                      />

                                    </div>

                                  </div>
                                );
                              }
                            )}

                        </div>
                      )}

                    </section>

                  </div>

                  {/* =============================================
                      MONTHLY ACTIVITY
                  ============================================= */}

                  <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <SectionTitle
                        title="Applications over time"
                        description="Application activity during the last six months."
                      />

                      <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Last 6 months
                      </span>

                    </div>

                    {analytics
                      .applicationsByMonth
                      .length ===
                    0 ? (
                      <EmptyState
                        text="No monthly application activity yet."
                      />
                    ) : (
                      <div className="mt-8 overflow-x-auto">

                        <div className="flex min-w-[520px] items-end gap-4 border-b border-slate-200 pb-3">

                          {analytics
                            .applicationsByMonth
                            .map(
                              (
                                item
                              ) => {
                                const height =
                                  (
                                    item.count /
                                    maxMonthlyApplications
                                  ) *
                                  180;

                                return (
                                  <div
                                    key={
                                      item.month
                                    }
                                    className="flex min-w-[72px] flex-1 flex-col items-center"
                                  >

                                    <p className="mb-2 text-xs font-bold text-slate-700">
                                      {
                                        item.count
                                      }
                                    </p>

                                    <div className="flex h-[180px] w-full items-end justify-center">

                                      <div
                                        className="w-full max-w-12 rounded-t-xl bg-blue-600"
                                        style={{
                                          height:
                                            `${Math.max(
                                              height,
                                              8
                                            )}px`,
                                        }}
                                      />

                                    </div>

                                    <p className="mt-3 whitespace-nowrap text-xs font-medium text-slate-500">
                                      {
                                        formatMonth(
                                          item.month
                                        )
                                      }
                                    </p>

                                  </div>
                                );
                              }
                            )}

                        </div>

                      </div>
                    )}

                  </section>

                  {/* =============================================
                      SAVED JOBS
                  ============================================= */}

                  <section className="mt-6">

                    <div className="flex items-end justify-between gap-4">

                      <SectionTitle
                        title="Saved job health"
                        description="Stay ahead of saved-job deadlines."
                      />

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/saved-jobs"
                          )
                        }
                        className="hidden text-sm font-semibold text-blue-600 hover:text-blue-700 sm:block"
                      >
                        View Saved Jobs →
                      </button>

                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">

                      <InfoCard
                        label="Due soon"
                        value={
                          analytics
                            .savedJobs
                            .next7Days
                        }
                        description="Deadlines within the next 7 days"
                      />

                      <InfoCard
                        label="Expired"
                        value={
                          analytics
                            .savedJobs
                            .expired
                        }
                        description="Saved opportunities with passed deadlines"
                      />

                      <InfoCard
                        label="No deadline"
                        value={
                          analytics
                            .savedJobs
                            .noDeadline
                        }
                        description="Saved opportunities without a deadline"
                      />

                    </div>

                  </section>

                  {/* =============================================
                      UPCOMING / RECENT
                  ============================================= */}

                  <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

                    {/* UPCOMING INTERVIEWS */}

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">

                        <SectionTitle
                          title="Upcoming interviews"
                          description="Your next scheduled interview rounds."
                        />

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/interviews"
                            )
                          }
                          className="shrink-0 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                        >
                          View all
                        </button>

                      </div>

                      <div className="p-5 sm:p-6">

                        {analytics
                          .upcomingInterviews
                          .length ===
                        0 ? (
                          <EmptyState
                            text="No upcoming interviews."
                            compact
                          />
                        ) : (
                          <div className="space-y-3">

                            {analytics
                              .upcomingInterviews
                              .map(
                                (
                                  interview
                                ) => (
                                  <UpcomingInterviewItem
                                    key={
                                      interview.id
                                    }
                                    interview={
                                      interview
                                    }
                                    formatDateTime={
                                      formatDateTime
                                    }
                                  />
                                )
                              )}

                          </div>
                        )}

                      </div>

                    </section>

                    {/* RECENT APPLICATIONS */}

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">

                        <SectionTitle
                          title="Recent applications"
                          description="Your most recently updated applications."
                        />

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/applications"
                            )
                          }
                          className="shrink-0 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                        >
                          View all
                        </button>

                      </div>

                      <div className="p-5 sm:p-6">

                        {analytics
                          .recentApplications
                          .length ===
                        0 ? (
                          <EmptyState
                            text="No applications yet."
                            compact
                          />
                        ) : (
                          <div className="space-y-3">

                            {analytics
                              .recentApplications
                              .map(
                                (
                                  application
                                ) => (
                                  <RecentApplicationItem
                                    key={
                                      application.id
                                    }
                                    application={
                                      application
                                    }
                                    formatDate={
                                      formatDate
                                    }
                                    getStatusClasses={
                                      getApplicationStatusClasses
                                    }
                                  />
                                )
                              )}

                          </div>
                        )}

                      </div>

                    </section>

                  </div>

                </>
              )}

          </main>

        </div>

      </div>
    </>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

type SectionTitleProps = {
  title: string;

  description: string;
};

function SectionTitle({
  title,
  description,
}: SectionTitleProps) {
  return (
    <div>

      <h2 className="text-base font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

type MetricCardProps = {
  title: string;

  value: number;

  description: string;

  icon: React.ReactNode;
};

function MetricCard({
  title,
  value,
  description,
  icon,
}: MetricCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   RATE CARD
========================================================= */

type RateCardProps = {
  title: string;

  value: number;

  description: string;
};

function RateCard({
  title,
  value,
  description,
}: RateCardProps) {
  const safeValue =
    Math.min(
      Math.max(
        value,
        0
      ),
      100
    );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-bold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

        <p className="shrink-0 text-2xl font-bold tracking-tight text-slate-900">
          {safeValue.toFixed(
            1
          )}
          %
        </p>

      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{
            width:
              `${safeValue}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   PIPELINE ITEM
========================================================= */

type PipelineItemProps = {
  label: string;

  value: number;

  strong?: boolean;
};

function PipelineItem({
  label,
  value,
  strong = false,
}: PipelineItemProps) {
  return (
    <div
      className={
        strong
          ? "rounded-xl border border-blue-200 bg-blue-50 p-4"
          : "rounded-xl border border-slate-200 bg-slate-50 p-4"
      }
    >

      <p
        className={
          strong
            ? "text-xs font-semibold uppercase tracking-wide text-blue-600"
            : "text-xs font-semibold uppercase tracking-wide text-slate-400"
        }
      >
        {label}
      </p>

      <p
        className={
          strong
            ? "mt-2 text-2xl font-bold text-blue-700"
            : "mt-2 text-2xl font-bold text-slate-900"
        }
      >
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

type InfoCardProps = {
  label: string;

  value: number;

  description: string;
};

function InfoCard({
  label,
  value,
  description,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-bold text-slate-900">
            {label}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

        <div className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 px-3 text-lg font-bold text-slate-900">
          {value}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   UPCOMING INTERVIEW ITEM
========================================================= */

type UpcomingInterviewItemProps = {
  interview:
    AnalyticsUpcomingInterview;

  formatDateTime: (
    value:
      string | null
  ) => string;
};

function UpcomingInterviewItem({
  interview,
  formatDateTime,
}: UpcomingInterviewItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100/70">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {
                interview.interview_type
              }
            </span>

            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              {
                interview.result ||
                "Pending"
              }
            </span>

          </div>

          <p className="mt-3 break-words text-sm font-bold text-slate-900">
            {
              interview.job_title
            }
          </p>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {
              interview.company
            }
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

            <span>
              {
                formatDateTime(
                  interview.scheduled_at
                )
              }
            </span>

            {interview.interviewer_name && (
              <span>
                Interviewer:{" "}
                {
                  interview.interviewer_name
                }
              </span>
            )}

          </div>

        </div>

        {interview.meeting_url && (
          <a
            href={
              interview.meeting_url
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Join meeting →
          </a>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   RECENT APPLICATION ITEM
========================================================= */

type RecentApplicationItemProps = {
  application:
    AnalyticsRecentApplication;

  formatDate: (
    value:
      string | null
  ) => string;

  getStatusClasses: (
    status:
      string
  ) => string;
};

function RecentApplicationItem({
  application,
  formatDate,
  getStatusClasses,
}: RecentApplicationItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100/70">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

        <div className="min-w-0">

          <p className="break-words text-sm font-bold text-slate-900">
            {
              application.job_title
            }
          </p>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {
              application.company
            }
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Applied:{" "}
            {
              formatDate(
                application.date_applied
              )
            }
          </p>

        </div>

        <span
          className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
            application.status
          )}`}
        >
          {
            application.status
          }
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

type EmptyStateProps = {
  text: string;

  compact?: boolean;
};

function EmptyState({
  text,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center ${
        compact
          ? "py-8"
          : "mt-5 py-10"
      }`}
    >

      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">

        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 8v4" />

          <path d="M12 16h.01" />

          <circle
            cx="12"
            cy="12"
            r="9"
          />
        </svg>

      </div>

      <p className="mt-3 text-sm font-medium text-slate-500">
        {text}
      </p>

    </div>
  );
}

export default Analytics;