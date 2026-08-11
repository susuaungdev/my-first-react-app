import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar";

import {
  deleteInterview,
  getInterviews,
  type Interview,
} from "../services/interviewService";

import {
  getApplications,
  type Application,
} from "../services/applicationService";

import InterviewForm from "../components/interviews/InterviewForm";

/* =========================================================
   FILTER TYPES
========================================================= */

type TimeFilter =
  | "all"
  | "upcoming"
  | "past";

type ResultFilter =
  | "all"
  | "Pending"
  | "Passed"
  | "Failed"
  | "Offer"
  | "Cancelled";

/* =========================================================
   INTERVIEWS PAGE
========================================================= */

function Interviews() {
  const navigate =
    useNavigate();

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  };

  /* =========================================================
     DATA
  ========================================================= */

  const [
    interviews,
    setInterviews,
  ] =
    useState<
      Interview[]
    >([]);

  const [
    applications,
    setApplications,
  ] =
    useState<
      Application[]
    >([]);

  /* =========================================================
     LOADING / ERROR
  ========================================================= */

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

  /* =========================================================
     FILTERS
  ========================================================= */

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    timeFilter,
    setTimeFilter,
  ] =
    useState<TimeFilter>(
      "upcoming"
    );

  const [
    resultFilter,
    setResultFilter,
  ] =
    useState<ResultFilter>(
      "all"
    );

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState("all");

  /* =========================================================
     EDIT STATE
  ========================================================= */

  const [
    selectedInterview,
    setSelectedInterview,
  ] =
    useState<
      Interview | null
    >(null);

  const [
    selectedApplication,
    setSelectedApplication,
  ] =
    useState<
      Application | null
    >(null);

  /* =========================================================
     DELETE STATE
  ========================================================= */

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      number | null
    >(null);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData =
    async () => {
      try {
        setLoading(true);

        setError("");

        const [
          interviewResponse,
          applicationResponse,
        ] =
          await Promise.all([
            getInterviews(),
            getApplications(),
          ]);

        setInterviews(
          interviewResponse.interviews ||
            []
        );

        setApplications(
          applicationResponse.applications ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load interviews:",
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
            "Failed to load interviews."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     APPLICATION LOOKUP
  ========================================================= */

  const applicationMap =
    useMemo(() => {
      const map =
        new Map<
          number,
          Application
        >();

      applications.forEach(
        (
          application
        ) => {
          map.set(
            application.id,
            application
          );
        }
      );

      return map;
    }, [applications]);

  /* =========================================================
     INTERVIEW TYPES
  ========================================================= */

  const interviewTypes =
    useMemo(() => {
      return Array.from(
        new Set(
          interviews
            .map(
              (
                interview
              ) =>
                interview.interview_type
            )
            .filter(Boolean)
        )
      ).sort();
    }, [interviews]);

  /* =========================================================
     FILTERED INTERVIEWS
  ========================================================= */

  const filteredInterviews =
    useMemo(() => {
      const now =
        new Date();

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return interviews
        .filter(
          (
            interview
          ) => {
            const application =
              applicationMap.get(
                interview.application_id
              );

            const company =
              interview.company ||
              application?.company ||
              "";

            const jobTitle =
              interview.job_title ||
              application?.job_title ||
              "";

            const interviewer =
              interview.interviewer_name ||
              "";

            const interviewType =
              interview.interview_type ||
              "";

            /* ===============================================
               SEARCH
            =============================================== */

            if (
              normalizedSearch
            ) {
              const searchableText =
                [
                  company,
                  jobTitle,
                  interviewer,
                  interviewType,
                  interview.interviewer_email ||
                    "",
                  interview.location ||
                    "",
                ]
                  .join(" ")
                  .toLowerCase();

              if (
                !searchableText.includes(
                  normalizedSearch
                )
              ) {
                return false;
              }
            }

            /* ===============================================
               RESULT
            =============================================== */

            if (
              resultFilter !==
                "all" &&
              (
                interview.result ||
                "Pending"
              ) !== resultFilter
            ) {
              return false;
            }

            /* ===============================================
               TYPE
            =============================================== */

            if (
              typeFilter !==
                "all" &&
              interview.interview_type !==
                typeFilter
            ) {
              return false;
            }

            /* ===============================================
               TIME
            =============================================== */

            const interviewDate =
              new Date(
                interview.scheduled_at
              );

            if (
              !Number.isNaN(
                interviewDate.getTime()
              )
            ) {
              if (
                timeFilter ===
                  "upcoming" &&
                interviewDate <
                  now
              ) {
                return false;
              }

              if (
                timeFilter ===
                  "past" &&
                interviewDate >=
                  now
              ) {
                return false;
              }
            }

            return true;
          }
        )
        .sort(
          (
            a,
            b
          ) => {
            const aTime =
              new Date(
                a.scheduled_at
              ).getTime();

            const bTime =
              new Date(
                b.scheduled_at
              ).getTime();

            if (
              Number.isNaN(
                aTime
              ) ||
              Number.isNaN(
                bTime
              )
            ) {
              return 0;
            }

            if (
              timeFilter ===
              "past"
            ) {
              return (
                bTime -
                aTime
              );
            }

            return (
              aTime -
              bTime
            );
          }
        );
    }, [
      interviews,
      applicationMap,
      search,
      resultFilter,
      typeFilter,
      timeFilter,
    ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics =
    useMemo(() => {
      const now =
        new Date();

      const todayStart =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

      const todayEnd =
        new Date(
          todayStart
        );

      todayEnd.setDate(
        todayEnd.getDate() +
          1
      );

      const weekEnd =
        new Date(
          todayStart
        );

      weekEnd.setDate(
        weekEnd.getDate() +
          7
      );

      let upcoming = 0;

      let today = 0;

      let thisWeek = 0;

      let pending = 0;

      interviews.forEach(
        (
          interview
        ) => {
          const date =
            new Date(
              interview.scheduled_at
            );

          if (
            !Number.isNaN(
              date.getTime()
            )
          ) {
            if (
              date >= now
            ) {
              upcoming += 1;
            }

            if (
              date >=
                todayStart &&
              date <
                todayEnd
            ) {
              today += 1;
            }

            if (
              date >=
                todayStart &&
              date <
                weekEnd
            ) {
              thisWeek += 1;
            }
          }

          if (
            !interview.result ||
            interview.result ===
              "Pending"
          ) {
            pending += 1;
          }
        }
      );

      return {
        upcoming,
        today,
        thisWeek,
        pending,
      };
    }, [interviews]);

  /* =========================================================
     FORMAT DATE
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
     RESULT COLOR
  ========================================================= */

  const getResultClasses =
    (
      result:
        string | null
    ) => {
      switch (
        result ||
        "Pending"
      ) {
        case "Passed":
          return "bg-emerald-50 text-emerald-700";

        case "Failed":
          return "bg-red-50 text-red-700";

        case "Offer":
          return "bg-green-100 text-green-800";

        case "Cancelled":
          return "bg-slate-100 text-slate-600";

        default:
          return "bg-amber-50 text-amber-700";
      }
    };

  /* =========================================================
     EDIT INTERVIEW
  ========================================================= */

  const handleEdit =
    (
      interview:
        Interview
    ) => {
      const application =
        applicationMap.get(
          interview.application_id
        );

      if (!application) {
        setError(
          "The application linked to this interview could not be found."
        );

        return;
      }

      setSelectedApplication(
        application
      );

      setSelectedInterview(
        interview
      );
    };

  /* =========================================================
     CLOSE EDIT
  ========================================================= */

  const handleCloseEdit =
    () => {
      setSelectedInterview(
        null
      );

      setSelectedApplication(
        null
      );
    };

  /* =========================================================
     INTERVIEW UPDATED
  ========================================================= */

  const handleUpdated =
    async () => {
      await loadData();

      handleCloseEdit();
    };

  /* =========================================================
     DELETE INTERVIEW
  ========================================================= */

  const handleDelete =
    async (
      interview:
        Interview
    ) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${interview.interview_type}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          interview.id
        );

        setError("");

        await deleteInterview(
          interview.id
        );

        await loadData();
      } catch (error) {
        console.error(
          "Failed to delete interview:",
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
            "Failed to delete interview."
          );
        }
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters =
    () => {
      setSearch("");

      setTimeFilter(
        "all"
      );

      setResultFilter(
        "all"
      );

      setTypeFilter(
        "all"
      );
    };

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
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
            aria-label="Open menu"
          >
            <span className="text-xl">
              ☰
            </span>
          </button>

          <h1 className="text-lg font-bold text-blue-600">
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
            MAIN PAGE
        ===================================================== */}

        <div className="min-w-0 lg:ml-64">

          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

            {/* ===================================================
                PAGE HEADER
            =================================================== */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  CareerFlow
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Interviews
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Track upcoming interviews,
                  preparation, interview
                  results, meeting links,
                  and follow-ups across all
                  your job applications.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  loadData
                }
                disabled={
                  loading
                }
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

            </div>

            {/* ===================================================
                STATISTICS
            =================================================== */}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                label="Upcoming"
                value={
                  statistics.upcoming
                }
                description="Scheduled interviews"
              />

              <StatCard
                label="Today"
                value={
                  statistics.today
                }
                description="Interviews today"
              />

              <StatCard
                label="Next 7 days"
                value={
                  statistics.thisWeek
                }
                description="Coming this week"
              />

              <StatCard
                label="Pending results"
                value={
                  statistics.pending
                }
                description="Awaiting an outcome"
              />

            </div>

            {/* ===================================================
                ERROR
            =================================================== */}

            {error && (
              <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                <p className="text-sm text-red-700">
                  {
                    error
                  }
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-800"
                >
                  ×
                </button>

              </div>
            )}

            {/* ===================================================
                FILTER PANEL
            =================================================== */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                {/* SEARCH */}

                <div>

                  <label
                    htmlFor="interview-search"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Search
                  </label>

                  <input
                    id="interview-search"
                    type="search"
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Company, job, interviewer..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* TIME */}

                <div>

                  <label
                    htmlFor="interview-time-filter"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Time
                  </label>

                  <select
                    id="interview-time-filter"
                    value={
                      timeFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setTimeFilter(
                        event.target
                          .value as TimeFilter
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="upcoming">
                      Upcoming
                    </option>

                    <option value="past">
                      Past
                    </option>

                    <option value="all">
                      All interviews
                    </option>

                  </select>

                </div>

                {/* RESULT */}

                <div>

                  <label
                    htmlFor="interview-result-filter"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Result
                  </label>

                  <select
                    id="interview-result-filter"
                    value={
                      resultFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setResultFilter(
                        event.target
                          .value as ResultFilter
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >

                    <option value="all">
                      All results
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Passed">
                      Passed
                    </option>

                    <option value="Failed">
                      Failed
                    </option>

                    <option value="Offer">
                      Offer
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

                {/* TYPE */}

                <div>

                  <label
                    htmlFor="interview-type-filter"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Interview type
                  </label>

                  <select
                    id="interview-type-filter"
                    value={
                      typeFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setTypeFilter(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >

                    <option value="all">
                      All types
                    </option>

                    {interviewTypes.map(
                      (
                        type
                      ) => (
                        <option
                          key={
                            type
                          }
                          value={
                            type
                          }
                        >
                          {
                            type
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      filteredInterviews.length
                    }
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      interviews.length
                    }
                  </span>{" "}
                  interviews
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="text-left text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Clear filters
                </button>

              </div>

            </div>

            {/* ===================================================
                LOADING
            =================================================== */}

            {loading && (
              <div className="mt-6 flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="text-center">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Loading interviews...
                  </p>

                </div>

              </div>
            )}

            {/* ===================================================
                EMPTY DATABASE
            =================================================== */}

            {!loading &&
              interviews.length ===
                0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                    ◷
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-slate-900">
                    No interviews yet
                  </h2>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Interviews you create from
                    your job applications will
                    automatically appear here.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/applications"
                      )
                    }
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Go to Applications
                  </button>

                </div>
              )}

            {/* ===================================================
                NO FILTER RESULTS
            =================================================== */}

            {!loading &&
              interviews.length >
                0 &&
              filteredInterviews.length ===
                0 && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

                  <h2 className="text-base font-bold text-slate-900">
                    No matching interviews
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Try changing your search
                    or filters.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Clear filters
                  </button>

                </div>
              )}

            {/* ===================================================
                INTERVIEW CARDS
            =================================================== */}

            {!loading &&
              filteredInterviews.length >
                0 && (
                <div className="mt-6 space-y-4">

                  {filteredInterviews.map(
                    (
                      interview
                    ) => {
                      const application =
                        applicationMap.get(
                          interview.application_id
                        );

                      const company =
                        interview.company ||
                        application?.company ||
                        "Unknown company";

                      const jobTitle =
                        interview.job_title ||
                        application?.job_title ||
                        "Unknown position";

                      const result =
                        interview.result ||
                        "Pending";

                      const isDeleting =
                        deletingId ===
                        interview.id;

                      return (
                        <article
                          key={
                            interview.id
                          }
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                        >

                          {/* =========================================
                              CARD HEADER
                          ========================================= */}

                          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                  {
                                    interview.interview_type
                                  }
                                </span>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getResultClasses(
                                    result
                                  )}`}
                                >
                                  {
                                    result
                                  }
                                </span>

                              </div>

                              <h2 className="mt-3 break-words text-lg font-bold text-slate-900">
                                {
                                  jobTitle
                                }
                              </h2>

                              <p className="mt-1 break-words text-sm font-semibold text-slate-600">
                                {
                                  company
                                }
                              </p>

                            </div>

                            <div className="flex shrink-0 items-center gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    interview
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    interview
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isDeleting
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>

                            </div>

                          </div>

                          {/* =========================================
                              CARD CONTENT
                          ========================================= */}

                          <div className="p-5 sm:p-6">

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                              <InterviewDetail
                                label="Date & time"
                                value={
                                  formatDateTime(
                                    interview.scheduled_at
                                  )
                                }
                              />

                              <InterviewDetail
                                label="Interviewer"
                                value={
                                  interview.interviewer_name ||
                                  "Not set"
                                }
                              />

                              <InterviewDetail
                                label="Location"
                                value={
                                  interview.location ||
                                  "Not set"
                                }
                              />

                              <InterviewDetail
                                label="Follow-up"
                                value={
                                  interview.follow_up_date
                                    ? formatDateTime(
                                        interview.follow_up_date
                                      )
                                    : "Not set"
                                }
                              />

                            </div>

                            {/* =======================================
                                TIMEZONE
                            ======================================= */}

                            {interview.timezone && (
                              <p className="mt-4 text-xs text-slate-400">
                                Timezone:{" "}
                                {
                                  interview.timezone
                                }
                              </p>
                            )}

                            {/* =======================================
                                MEETING LINK
                            ======================================= */}

                            {interview.meeting_url && (
                              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                                  Online meeting
                                </p>

                                <a
                                  href={
                                    interview.meeting_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex break-all text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  Join interview meeting →
                                </a>

                              </div>
                            )}

                            {/* =======================================
                                PREPARATION NOTES
                            ======================================= */}

                            {interview.preparation_notes && (
                              <div className="mt-5">

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Preparation notes
                                </p>

                                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                    {
                                      interview.preparation_notes
                                    }
                                  </p>

                                </div>

                              </div>
                            )}

                            {/* =======================================
                                INTERVIEW NOTES
                            ======================================= */}

                            {interview.notes && (
                              <div className="mt-5">

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Interview notes
                                </p>

                                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                    {
                                      interview.notes
                                    }
                                  </p>

                                </div>

                              </div>
                            )}

                            {/* =======================================
                                EMAIL
                            ======================================= */}

                            {interview.interviewer_email && (
                              <div className="mt-5 border-t border-slate-100 pt-4">

                                <p className="text-xs text-slate-500">
                                  Interviewer email:{" "}
                                  <span className="font-medium text-slate-700">
                                    {
                                      interview.interviewer_email
                                    }
                                  </span>
                                </p>

                              </div>
                            )}

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              )}

          </main>

        </div>

      </div>

      {/* =====================================================
          EDIT INTERVIEW MODAL
      ===================================================== */}

      {selectedInterview &&
        selectedApplication && (
          <InterviewForm
            application={
              selectedApplication
            }

            interview={
              selectedInterview
            }

            onClose={
              handleCloseEdit
            }

            onUpdated={
              handleUpdated
            }
          />
        )}

    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

type StatCardProps = {
  label: string;
  value: number;
  description: string;
};

function StatCard({
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   INTERVIEW DETAIL
========================================================= */

type InterviewDetailProps = {
  label: string;
  value: string;
};

function InterviewDetail({
  label,
  value,
}: InterviewDetailProps) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}

export default Interviews;