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

import SavedJobForm from "../components/savedJobs/SavedJobForm";

import {
  deleteSavedJob,
  getSavedJobs,
  type SavedJob,
} from "../services/savedJobService";

import {
  createApplication,
  type CreateApplicationData,
} from "../services/applicationService";

/* =========================================================
   FILTER TYPES
========================================================= */

type DeadlineFilter =
  | "all"
  | "upcoming"
  | "expired"
  | "no-deadline";

/* =========================================================
   SAVED JOBS PAGE
========================================================= */

function SavedJobs() {
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
    savedJobs,
    setSavedJobs,
  ] =
    useState<
      SavedJob[]
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
    employmentTypeFilter,
    setEmploymentTypeFilter,
  ] =
    useState("all");

  const [
    deadlineFilter,
    setDeadlineFilter,
  ] =
    useState<DeadlineFilter>(
      "all"
    );

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [
    showCreateForm,
    setShowCreateForm,
  ] =
    useState(false);

  const [
    savedJobToEdit,
    setSavedJobToEdit,
  ] =
    useState<
      SavedJob | null
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
     CONVERT STATE
  ========================================================= */

  const [
    convertingId,
    setConvertingId,
  ] =
    useState<
      number | null
    >(null);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  const loadSavedJobs =
    async () => {
      try {
        setLoading(true);

        setError("");

        const data =
          await getSavedJobs();

        setSavedJobs(
          data.savedJobs ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load saved jobs:",
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
            "Failed to load saved jobs."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  /* =========================================================
     CREATE SAVED JOB IN LOCAL STATE
  ========================================================= */

  const handleSavedJobCreated =
    (
      newSavedJob:
        SavedJob
    ) => {
      setSavedJobs(
        (
          currentSavedJobs
        ) => [
          newSavedJob,
          ...currentSavedJobs,
        ]
      );

      setShowCreateForm(
        false
      );
    };

  /* =========================================================
     UPDATE SAVED JOB IN LOCAL STATE
  ========================================================= */

  const handleSavedJobUpdated =
    (
      updatedSavedJob:
        SavedJob
    ) => {
      setSavedJobs(
        (
          currentSavedJobs
        ) =>
          currentSavedJobs.map(
            (
              savedJob
            ) =>
              savedJob.id ===
              updatedSavedJob.id
                ? updatedSavedJob
                : savedJob
          )
      );

      setSavedJobToEdit(
        null
      );
    };

  /* =========================================================
     EMPLOYMENT TYPES
  ========================================================= */

  const employmentTypes =
    useMemo(() => {
      return Array.from(
        new Set(
          savedJobs
            .map(
              (
                savedJob
              ) =>
                savedJob.employment_type
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(
                  value
                )
            )
        )
      ).sort();
    }, [savedJobs]);

  /* =========================================================
     FILTER SAVED JOBS
  ========================================================= */

  const filteredSavedJobs =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      return savedJobs.filter(
        (
          savedJob
        ) => {
          /* SEARCH */

          if (
            normalizedSearch
          ) {
            const searchableText =
              [
                savedJob.company,
                savedJob.job_title,
                savedJob.location ||
                  "",
                savedJob.salary ||
                  "",
                savedJob.employment_type ||
                  "",
                savedJob.description ||
                  "",
                savedJob.notes ||
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

          /* EMPLOYMENT TYPE */

          if (
            employmentTypeFilter !==
              "all" &&
            savedJob.employment_type !==
              employmentTypeFilter
          ) {
            return false;
          }

          /* DEADLINE */

          if (
            deadlineFilter !==
            "all"
          ) {
            if (
              deadlineFilter ===
              "no-deadline"
            ) {
              return (
                !savedJob.deadline
              );
            }

            if (
              !savedJob.deadline
            ) {
              return false;
            }

            const deadlineDate =
              new Date(
                savedJob.deadline
              );

            deadlineDate.setHours(
              0,
              0,
              0,
              0
            );

            if (
              deadlineFilter ===
              "upcoming"
            ) {
              return (
                deadlineDate >=
                today
              );
            }

            if (
              deadlineFilter ===
              "expired"
            ) {
              return (
                deadlineDate <
                today
              );
            }
          }

          return true;
        }
      );
    }, [
      savedJobs,
      search,
      employmentTypeFilter,
      deadlineFilter,
    ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics =
    useMemo(() => {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const nextSevenDays =
        new Date(
          today
        );

      nextSevenDays.setDate(
        nextSevenDays.getDate() +
          7
      );

      let upcomingDeadlines =
        0;

      let expired =
        0;

      let noDeadline =
        0;

      savedJobs.forEach(
        (
          savedJob
        ) => {
          if (
            !savedJob.deadline
          ) {
            noDeadline += 1;

            return;
          }

          const deadlineDate =
            new Date(
              savedJob.deadline
            );

          deadlineDate.setHours(
            0,
            0,
            0,
            0
          );

          if (
            deadlineDate <
            today
          ) {
            expired += 1;
          }

          if (
            deadlineDate >=
              today &&
            deadlineDate <=
              nextSevenDays
          ) {
            upcomingDeadlines +=
              1;
          }
        }
      );

      return {
        total:
          savedJobs.length,

        upcomingDeadlines,

        expired,

        noDeadline,
      };
    }, [savedJobs]);

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
     DEADLINE INFO
  ========================================================= */

  const getDeadlineInfo =
    (
      deadline:
        string | null
    ) => {
      if (!deadline) {
        return {
          label:
            "No deadline",

          classes:
            "bg-slate-100 text-slate-600",
        };
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const deadlineDate =
        new Date(
          deadline
        );

      deadlineDate.setHours(
        0,
        0,
        0,
        0
      );

      const difference =
        deadlineDate.getTime() -
        today.getTime();

      const days =
        Math.ceil(
          difference /
            (
              1000 *
              60 *
              60 *
              24
            )
        );

      if (
        days < 0
      ) {
        return {
          label:
            "Deadline passed",

          classes:
            "bg-red-50 text-red-700",
        };
      }

      if (
        days === 0
      ) {
        return {
          label:
            "Due today",

          classes:
            "bg-red-50 text-red-700",
        };
      }

      if (
        days <= 3
      ) {
        return {
          label:
            `${days} day${
              days === 1
                ? ""
                : "s"
            } left`,

          classes:
            "bg-amber-50 text-amber-700",
        };
      }

      return {
        label:
          `${days} days left`,

        classes:
          "bg-emerald-50 text-emerald-700",
      };
    };

  /* =========================================================
     DELETE SAVED JOB
  ========================================================= */

  const handleDelete =
    async (
      savedJob:
        SavedJob
    ) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${savedJob.job_title}" at ${savedJob.company}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          savedJob.id
        );

        setError("");

        await deleteSavedJob(
          savedJob.id
        );

        /*
          Remove only the deleted job.
          No full page reload.
        */

        setSavedJobs(
          (
            currentSavedJobs
          ) =>
            currentSavedJobs.filter(
              (
                item
              ) =>
                item.id !==
                savedJob.id
            )
        );
      } catch (error) {
        console.error(
          "Failed to delete saved job:",
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
            "Failed to delete saved job."
          );
        }
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =========================================================
     CONVERT TO APPLICATION
  ========================================================= */

  const handleConvertToApplication =
    async (
      savedJob:
        SavedJob
    ) => {
      const confirmed =
        window.confirm(
          `Convert "${savedJob.job_title}" at ${savedJob.company} into an application?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setConvertingId(
          savedJob.id
        );

        setError("");

        const applicationData:
          CreateApplicationData =
          {
            company:
              savedJob.company,

            job_title:
              savedJob.job_title,

            location:
              savedJob.location ||
              "",

            salary:
              savedJob.salary ||
              "",

            employment_type:
              savedJob.employment_type ||
              "Full-time",

            job_url:
              savedJob.job_url ||
              "",

            description:
              savedJob.description ||
              "",

            deadline:
              savedJob.deadline
                ? savedJob.deadline.slice(
                    0,
                    10
                  )
                : "",

            notes:
              savedJob.notes ||
              "",

            status:
              "Applied",
          };

        /*
          Create the application first.
          Do not delete the saved job unless
          creation succeeds.
        */

        await createApplication(
          applicationData
        );

        await deleteSavedJob(
          savedJob.id
        );

        setSavedJobs(
          (
            currentSavedJobs
          ) =>
            currentSavedJobs.filter(
              (
                item
              ) =>
                item.id !==
                savedJob.id
            )
        );

        navigate(
          "/applications"
        );
      } catch (error) {
        console.error(
          "Failed to convert saved job:",
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
            "Failed to convert saved job to application."
          );
        }
      } finally {
        setConvertingId(
          null
        );
      }
    };

  /* =========================================================
     OPEN CREATE FORM
  ========================================================= */

  const handleOpenCreate =
    () => {
      setSavedJobToEdit(
        null
      );

      setShowCreateForm(
        true
      );
    };

  /* =========================================================
     OPEN EDIT FORM
  ========================================================= */

  const handleOpenEdit =
    (
      savedJob:
        SavedJob
    ) => {
      setShowCreateForm(
        false
      );

      setSavedJobToEdit(
        savedJob
      );
    };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters =
    () => {
      setSearch("");

      setEmploymentTypeFilter(
        "all"
      );

      setDeadlineFilter(
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
            MAIN
        ===================================================== */}

        <div className="min-w-0 lg:ml-64">

          {/* =====================================================
              DESKTOP HEADER
          ===================================================== */}

          <DashboardHeader
            user={user}
          />

          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

            {/* ===================================================
                HEADER
            =================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  CareerFlow
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Saved Jobs
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Save opportunities before you apply,
                  monitor deadlines, and convert the best
                  jobs into tracked applications.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleOpenCreate
                }
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
              >
                + Save Job
              </button>

            </div>

            {/* ===================================================
                STATS
            =================================================== */}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                label="Saved jobs"
                value={
                  statistics.total
                }
                description="Opportunities tracked"
              />

              <StatCard
                label="Next 7 days"
                value={
                  statistics.upcomingDeadlines
                }
                description="Deadlines approaching"
              />

              <StatCard
                label="Expired"
                value={
                  statistics.expired
                }
                description="Deadlines passed"
              />

              <StatCard
                label="No deadline"
                value={
                  statistics.noDeadline
                }
                description="No date specified"
              />

            </div>

            {/* ===================================================
                ERROR
            =================================================== */}

            {error && (
              <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                <p className="text-sm text-red-700">
                  {error}
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
                FILTERS
            =================================================== */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* SEARCH */}

                <div>

                  <label
                    htmlFor="saved-job-search"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Search
                  </label>

                  <input
                    id="saved-job-search"
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
                    placeholder="Company, role, location..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* EMPLOYMENT TYPE */}

                <div>

                  <label
                    htmlFor="saved-job-employment"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Employment type
                  </label>

                  <select
                    id="saved-job-employment"
                    value={
                      employmentTypeFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setEmploymentTypeFilter(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="all">
                      All types
                    </option>

                    {employmentTypes.map(
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
                          {type}
                        </option>
                      )
                    )}
                  </select>

                </div>

                {/* DEADLINE */}

                <div>

                  <label
                    htmlFor="saved-job-deadline"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Deadline
                  </label>

                  <select
                    id="saved-job-deadline"
                    value={
                      deadlineFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setDeadlineFilter(
                        event.target
                          .value as DeadlineFilter
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="all">
                      All deadlines
                    </option>

                    <option value="upcoming">
                      Upcoming
                    </option>

                    <option value="expired">
                      Expired
                    </option>

                    <option value="no-deadline">
                      No deadline
                    </option>
                  </select>

                </div>

              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      filteredSavedJobs.length
                    }
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      savedJobs.length
                    }
                  </span>{" "}
                  saved jobs
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="text-left text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>

              </div>

            </div>

            {/* ===================================================
                INITIAL LOADING
            =================================================== */}

            {loading && (
              <div className="mt-6 flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="text-center">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading saved jobs...
                  </p>

                </div>

              </div>
            )}

            {/* ===================================================
                EMPTY DATABASE
            =================================================== */}

            {!loading &&
              savedJobs.length ===
                0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                    ♡
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-slate-900">
                    No saved jobs yet
                  </h2>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Save jobs you are interested in before
                    applying so you can compare opportunities
                    and keep track of deadlines.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleOpenCreate
                    }
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Save your first job
                  </button>

                </div>
              )}

            {/* ===================================================
                NO FILTER RESULTS
            =================================================== */}

            {!loading &&
              savedJobs.length >
                0 &&
              filteredSavedJobs.length ===
                0 && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

                  <h2 className="font-bold text-slate-900">
                    No matching saved jobs
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Try changing your search or filters.
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
                SAVED JOB CARDS
            =================================================== */}

            {!loading &&
              filteredSavedJobs.length >
                0 && (
                <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">

                  {filteredSavedJobs.map(
                    (
                      savedJob
                    ) => {
                      const deadlineInfo =
                        getDeadlineInfo(
                          savedJob.deadline
                        );

                      const isDeleting =
                        deletingId ===
                        savedJob.id;

                      const isConverting =
                        convertingId ===
                        savedJob.id;

                      const disabled =
                        isDeleting ||
                        isConverting;

                      return (
                        <article
                          key={
                            savedJob.id
                          }
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                        >

                          {/* CARD HEADER */}

                          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                              <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                  {savedJob.employment_type && (
                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                      {
                                        savedJob.employment_type
                                      }
                                    </span>
                                  )}

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${deadlineInfo.classes}`}
                                  >
                                    {
                                      deadlineInfo.label
                                    }
                                  </span>

                                </div>

                                <h2 className="mt-3 break-words text-lg font-bold text-slate-900">
                                  {
                                    savedJob.job_title
                                  }
                                </h2>

                                <p className="mt-1 text-sm font-semibold text-blue-600">
                                  {
                                    savedJob.company
                                  }
                                </p>

                              </div>

                              {/* ACTIONS */}

                              <div className="flex shrink-0 gap-2">

                                <button
                                  type="button"
                                  disabled={
                                    disabled
                                  }
                                  onClick={() =>
                                    handleOpenEdit(
                                      savedJob
                                    )
                                  }
                                  className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    disabled
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      savedJob
                                    )
                                  }
                                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isDeleting
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>

                              </div>

                            </div>

                          </div>

                          {/* CARD BODY */}

                          <div className="space-y-5 p-5 sm:p-6">

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                              <Detail
                                label="Location"
                                value={
                                  savedJob.location ||
                                  "Not set"
                                }
                              />

                              <Detail
                                label="Salary"
                                value={
                                  savedJob.salary ||
                                  "Not set"
                                }
                              />

                              <Detail
                                label="Deadline"
                                value={
                                  formatDate(
                                    savedJob.deadline
                                  )
                                }
                              />

                              <Detail
                                label="Saved"
                                value={
                                  formatDate(
                                    savedJob.saved_at
                                  )
                                }
                              />

                            </div>

                            {/* DESCRIPTION */}

                            {savedJob.description && (
                              <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Description
                                </p>

                                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                  <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                    {
                                      savedJob.description
                                    }
                                  </p>

                                </div>

                              </div>
                            )}

                            {/* NOTES */}

                            {savedJob.notes && (
                              <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Notes
                                </p>

                                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                  <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                    {
                                      savedJob.notes
                                    }
                                  </p>

                                </div>

                              </div>
                            )}

                            {/* JOB URL */}

                            {savedJob.job_url && (
                              <a
                                href={
                                  savedJob.job_url
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex break-all text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                Open job posting →
                              </a>
                            )}

                            {/* CONVERT */}

                            <div className="border-t border-slate-100 pt-5">

                              <button
                                type="button"
                                disabled={
                                  disabled
                                }
                                onClick={() =>
                                  handleConvertToApplication(
                                    savedJob
                                  )
                                }
                                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isConverting
                                  ? "Creating application..."
                                  : "Convert to Application"}
                              </button>

                            </div>

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
          CREATE FORM
      ===================================================== */}

      {showCreateForm &&
        !savedJobToEdit && (
          <SavedJobForm
            onClose={() =>
              setShowCreateForm(
                false
              )
            }

            onCreated={
              handleSavedJobCreated
            }
          />
        )}

      {/* =====================================================
          EDIT FORM
      ===================================================== */}

      {savedJobToEdit && (
        <SavedJobForm
          savedJob={
            savedJobToEdit
          }

          onClose={() =>
            setSavedJobToEdit(
              null
            )
          }

          onUpdated={
            handleSavedJobUpdated
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

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   DETAIL
========================================================= */

type DetailProps = {
  label: string;
  value: string;
};

function Detail({
  label,
  value,
}: DetailProps) {
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

export default SavedJobs;