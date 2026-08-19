import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getApplicationStatusHistory,
  type Application,
  type ApplicationStatusHistory,
} from "../../services/applicationService";

import {
  deleteInterview,
  getApplicationInterviews,
  type Interview,
} from "../../services/interviewService";

import InterviewForm from "../interviews/InterviewForm";

/* =========================================================
   PROPS
========================================================= */

type ApplicationDetailsModalProps = {
  application: Application;
  onClose: () => void;
};

/* =========================================================
   APPLICATION DETAILS MODAL
========================================================= */

function ApplicationDetailsModal({
  application,
  onClose,
}: ApplicationDetailsModalProps) {
  const navigate =
    useNavigate();

  /* =========================================================
     STATUS HISTORY STATE
  ========================================================= */

  const [
    statusHistory,
    setStatusHistory,
  ] =
    useState<
      ApplicationStatusHistory[]
    >([]);

  const [
    loadingHistory,
    setLoadingHistory,
  ] =
    useState(true);

  const [
    historyError,
    setHistoryError,
  ] =
    useState("");

  /* =========================================================
     INTERVIEW STATE
  ========================================================= */

  const [
    interviews,
    setInterviews,
  ] =
    useState<
      Interview[]
    >([]);

  const [
    loadingInterviews,
    setLoadingInterviews,
  ] =
    useState(true);

  const [
    interviewError,
    setInterviewError,
  ] =
    useState("");

  /* =========================================================
     CREATE INTERVIEW STATE
  ========================================================= */

  const [
    showInterviewForm,
    setShowInterviewForm,
  ] =
    useState(false);

  /* =========================================================
     EDIT INTERVIEW STATE
  ========================================================= */

  const [
    interviewToEdit,
    setInterviewToEdit,
  ] =
    useState<
      Interview | null
    >(null);

  /* =========================================================
     DELETE INTERVIEW STATE
  ========================================================= */

  const [
    deletingInterviewId,
    setDeletingInterviewId,
  ] =
    useState<
      number | null
    >(null);

  /* =========================================================
     LOAD STATUS HISTORY
  ========================================================= */

  useEffect(() => {
    const loadStatusHistory =
      async () => {
        try {
          setLoadingHistory(
            true
          );

          setHistoryError(
            ""
          );

          const data =
            await getApplicationStatusHistory(
              application.id
            );

          setStatusHistory(
            data.history || []
          );
        } catch (error) {
          console.error(
            "Failed to load application status history:",
            error
          );

          if (
            error instanceof
            Error
          ) {
            setHistoryError(
              error.message
            );
          } else {
            setHistoryError(
              "Failed to load application history."
            );
          }
        } finally {
          setLoadingHistory(
            false
          );
        }
      };

    loadStatusHistory();
  }, [application.id]);

  /* =========================================================
     LOAD INTERVIEWS
  ========================================================= */

  const loadInterviews =
    async () => {
      try {
        setLoadingInterviews(
          true
        );

        setInterviewError(
          ""
        );

        const data =
          await getApplicationInterviews(
            application.id
          );

        setInterviews(
          data.interviews || []
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
          setInterviewError(
            error.message
          );
        } else {
          setInterviewError(
            "Failed to load interviews."
          );
        }
      } finally {
        setLoadingInterviews(
          false
        );
      }
    };

  useEffect(() => {
    loadInterviews();
  }, [application.id]);

  /* =========================================================
     OPEN CREATE INTERVIEW
  ========================================================= */

  const handleOpenCreateInterview =
    () => {
      setInterviewToEdit(
        null
      );

      setShowInterviewForm(
        true
      );
    };

  /* =========================================================
     CLOSE CREATE INTERVIEW
  ========================================================= */

  const handleCloseCreateInterview =
    () => {
      setShowInterviewForm(
        false
      );
    };

  /* =========================================================
     OPEN EDIT INTERVIEW
  ========================================================= */

  const handleEditInterview =
    (
      interview: Interview
    ) => {
      setShowInterviewForm(
        false
      );

      setInterviewToEdit(
        interview
      );
    };

  /* =========================================================
     CLOSE EDIT INTERVIEW
  ========================================================= */

  const handleCloseEditInterview =
    () => {
      setInterviewToEdit(
        null
      );
    };

  /* =========================================================
     INTERVIEW UPDATED
  ========================================================= */

  const handleInterviewUpdated =
    async () => {
      await loadInterviews();

      setInterviewToEdit(
        null
      );
    };

  /* =========================================================
     INTERVIEW CREATED
  ========================================================= */

  const handleInterviewCreated =
    async () => {
      await loadInterviews();

      setShowInterviewForm(
        false
      );
    };

  /* =========================================================
     DELETE INTERVIEW
  ========================================================= */

  const handleDeleteInterview =
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
        setDeletingInterviewId(
          interview.id
        );

        setInterviewError(
          ""
        );

        await deleteInterview(
          interview.id
        );

        await loadInterviews();
      } catch (error) {
        console.error(
          "Failed to delete interview:",
          error
        );

        if (
          error instanceof
          Error
        ) {
          setInterviewError(
            error.message
          );
        } else {
          setInterviewError(
            "Failed to delete interview."
          );
        }
      } finally {
        setDeletingInterviewId(
          null
        );
      }
    };

  /* =========================================================
     DATE HELPERS
  ========================================================= */

  const formatDate = (
    date: string | null
  ) => {
    if (!date) {
      return "Not set";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  };

  const formatDateTime = (
    date: string | null
  ) => {
    if (!date) {
      return "Not set";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  /* =========================================================
     VIEW RESUME
  ========================================================= */

  const handleViewResume =
    () => {
      if (
        !application.resume_id
      ) {
        return;
      }

      onClose();

      navigate(
        `/resumes/${application.resume_id}`
      );
    };

  /* =========================================================
     APPLICATION STATUS COLOR
  ========================================================= */

  const getStatusClasses = (
    status: string
  ) => {
    if (
      status === "Offer"
    ) {
      return {
        badge:
          "bg-emerald-50 text-emerald-700",

        dot:
          "bg-emerald-500",
      };
    }

    if (
      status ===
      "Rejected"
    ) {
      return {
        badge:
          "bg-red-50 text-red-700",

        dot:
          "bg-red-500",
      };
    }

    if (
      status ===
      "Withdrawn"
    ) {
      return {
        badge:
          "bg-slate-100 text-slate-600",

        dot:
          "bg-slate-400",
      };
    }

    if (
      status.includes(
        "Interview"
      )
    ) {
      return {
        badge:
          "bg-amber-50 text-amber-700",

        dot:
          "bg-amber-500",
      };
    }

    if (
      status ===
      "Applied"
    ) {
      return {
        badge:
          "bg-blue-50 text-blue-700",

        dot:
          "bg-blue-500",
      };
    }

    if (
      status ===
      "Screening"
    ) {
      return {
        badge:
          "bg-violet-50 text-violet-700",

        dot:
          "bg-violet-500",
      };
    }

    return {
      badge:
        "bg-slate-100 text-slate-600",

      dot:
        "bg-slate-400",
    };
  };

  /* =========================================================
     INTERVIEW RESULT COLOR
  ========================================================= */

  const getInterviewResultClasses =
    (
      result:
        string | null
    ) => {
      if (
        result === "Passed"
      ) {
        return "bg-emerald-50 text-emerald-700";
      }

      if (
        result === "Failed"
      ) {
        return "bg-red-50 text-red-700";
      }

      if (
        result === "Offer"
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
     PAGE
  ========================================================= */

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 px-4 py-6">

        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

            <div>

              <p className="text-sm font-semibold text-blue-600">
                Application details
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {
                  application.job_title
                }
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {
                  application.company
                }
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100"
              aria-label="Close details"
            >
              ×
            </button>

          </div>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="space-y-7 p-6">

            {/* ===================================================
                STATUS
            =================================================== */}

            <div className="flex flex-wrap items-center gap-3">

              <span
                className={`
                  rounded-full px-3 py-1 text-xs font-semibold

                  ${
                    getStatusClasses(
                      application.status
                    ).badge
                  }
                `}
              >
                {
                  application.status
                }
              </span>

              <span className="text-sm text-slate-500">
                {
                  application.employment_type ||
                  "Employment type not set"
                }
              </span>

            </div>

            {/* ===================================================
                BASIC INFORMATION
            =================================================== */}

            <section>

              <h3 className="text-sm font-bold text-slate-900">
                Basic information
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailItem
                  label="Company"
                  value={
                    application.company
                  }
                />

                <DetailItem
                  label="Job title"
                  value={
                    application.job_title
                  }
                />

                <DetailItem
                  label="Location"
                  value={
                    application.location ||
                    "Not set"
                  }
                />

                <DetailItem
                  label="Salary"
                  value={
                    application.salary ||
                    "Not set"
                  }
                />

                <DetailItem
                  label="Employment type"
                  value={
                    application.employment_type ||
                    "Not set"
                  }
                />

                <DetailItem
                  label="Status"
                  value={
                    application.status
                  }
                />

              </div>

            </section>

            {/* ===================================================
                RESUME USED
            =================================================== */}

            <section>

              <h3 className="text-sm font-bold text-slate-900">
                Resume used
              </h3>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                {application.resume_id &&
                application.resume_title ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Attached resume
                      </p>

                      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                        {
                          application.resume_title
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        This resume is linked to this job application.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleViewResume
                      }
                      className="shrink-0 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      View Resume
                    </button>

                  </div>
                ) : (
                  <div>

                    <p className="text-sm font-medium text-slate-700">
                      No resume attached
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      You can attach a resume by editing this application.
                    </p>

                  </div>
                )}

              </div>

            </section>

            {/* ===================================================
                INTERVIEW MANAGEMENT
            =================================================== */}

            <section>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Interviews
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage every interview round for this application.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    handleOpenCreateInterview
                  }
                  className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  + Add Interview
                </button>

              </div>

              {/* =================================================
                  INTERVIEW ERROR
              ================================================= */}

              {interviewError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {
                    interviewError
                  }
                </div>
              )}

              {/* =================================================
                  LOADING INTERVIEWS
              ================================================= */}

              {loadingInterviews && (
                <div className="mt-4 flex min-h-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">

                  <div className="text-center">

                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                    <p className="mt-2 text-xs text-slate-500">
                      Loading interviews...
                    </p>

                  </div>

                </div>
              )}

              {/* =================================================
                  NO INTERVIEWS
              ================================================= */}

              {!loadingInterviews &&
                interviews.length ===
                  0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">

                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
                      ◷
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      No interviews scheduled
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Add recruiter screens, technical interviews,
                      coding interviews, final rounds, and more.
                    </p>

                    <button
                      type="button"
                      onClick={
                        handleOpenCreateInterview
                      }
                      className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Schedule first interview
                    </button>

                  </div>
                )}

              {/* =================================================
                  INTERVIEW LIST
              ================================================= */}

              {!loadingInterviews &&
                interviews.length >
                  0 && (
                  <div className="mt-4 space-y-4">

                    {interviews.map(
                      (
                        interview,
                        index
                      ) => (
                        <div
                          key={
                            interview.id
                          }
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >

                          {/* =========================================
                              INTERVIEW HEADER
                          ========================================= */}

                          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-100 px-2 text-xs font-bold text-blue-700">
                                  {
                                    index +
                                    1
                                  }
                                </span>

                                <h4 className="text-sm font-bold text-slate-900">
                                  {
                                    interview.interview_type
                                  }
                                </h4>

                                <span
                                  className={`
                                    rounded-full px-2.5 py-1 text-xs font-semibold

                                    ${
                                      getInterviewResultClasses(
                                        interview.result
                                      )
                                    }
                                  `}
                                >
                                  {
                                    interview.result ||
                                    "Pending"
                                  }
                                </span>

                              </div>

                              <p className="mt-2 text-sm font-medium text-slate-600">
                                {
                                  formatDateTime(
                                    interview.scheduled_at
                                  )
                                }
                              </p>

                              {interview.timezone && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    interview.timezone
                                  }
                                </p>
                              )}

                            </div>

                            {/* =======================================
                                EDIT / DELETE BUTTONS
                            ======================================= */}

                            <div className="flex shrink-0 items-center gap-2">

                              <button
                                type="button"
                                disabled={
                                  deletingInterviewId ===
                                  interview.id
                                }
                                onClick={() =>
                                  handleEditInterview(
                                    interview
                                  )
                                }
                                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={
                                  deletingInterviewId ===
                                  interview.id
                                }
                                onClick={() =>
                                  handleDeleteInterview(
                                    interview
                                  )
                                }
                                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingInterviewId ===
                                interview.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>

                            </div>

                          </div>

                          {/* =========================================
                              INTERVIEW DETAILS
                          ========================================= */}

                          <div className="space-y-5 p-5">

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                              <MiniDetailItem
                                label="Interviewer"
                                value={
                                  interview.interviewer_name ||
                                  "Not set"
                                }
                              />

                              <MiniDetailItem
                                label="Email"
                                value={
                                  interview.interviewer_email ||
                                  "Not set"
                                }
                              />

                              <MiniDetailItem
                                label="Location"
                                value={
                                  interview.location ||
                                  "Not set"
                                }
                              />

                              <MiniDetailItem
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
                                MEETING URL
                            ======================================= */}

                            {interview.meeting_url && (
                              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                                  Meeting
                                </p>

                                <a
                                  href={
                                    interview.meeting_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex break-all text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  Open meeting link →
                                </a>

                              </div>
                            )}

                            {/* =======================================
                                PREPARATION NOTES
                            ======================================= */}

                            {interview.preparation_notes && (
                              <div>

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
                              <div>

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

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

            </section>

            {/* ===================================================
                APPLICATION TIMELINE
            =================================================== */}

            <section>

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Application timeline
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Track how this application has moved through your hiring pipeline.
                  </p>

                </div>

                {!loadingHistory &&
                  !historyError &&
                  statusHistory.length >
                    0 && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {
                        statusHistory.length
                      }{" "}
                      {
                        statusHistory.length ===
                        1
                          ? "event"
                          : "events"
                      }
                    </span>
                  )}

              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">

                {/* =================================================
                    TIMELINE LOADING
                ================================================= */}

                {loadingHistory && (
                  <div className="flex items-center gap-3 py-3">

                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                    <p className="text-sm text-slate-500">
                      Loading application timeline...
                    </p>

                  </div>
                )}

                {/* =================================================
                    TIMELINE ERROR
                ================================================= */}

                {!loadingHistory &&
                  historyError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                      <p className="text-sm font-semibold text-red-700">
                        Could not load timeline
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-600">
                        {
                          historyError
                        }
                      </p>

                    </div>
                  )}

                {/* =================================================
                    EMPTY TIMELINE
                ================================================= */}

                {!loadingHistory &&
                  !historyError &&
                  statusHistory.length ===
                    0 && (
                    <div className="rounded-xl bg-slate-50 px-4 py-5 text-center">

                      <p className="text-sm font-semibold text-slate-700">
                        No status history yet
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Status changes will appear here after this application is updated.
                      </p>

                    </div>
                  )}

                {/* =================================================
                    TIMELINE
                ================================================= */}

                {!loadingHistory &&
                  !historyError &&
                  statusHistory.length >
                    0 && (
                    <div>

                      {statusHistory.map(
                        (
                          history,
                          index
                        ) => {
                          const isLast =
                            index ===
                            statusHistory.length -
                              1;

                          const statusStyles =
                            getStatusClasses(
                              history.new_status
                            );

                          return (
                            <div
                              key={
                                history.id
                              }
                              className="relative flex gap-4"
                            >

                              {/* TIMELINE LEFT */}

                              <div className="relative flex w-5 shrink-0 justify-center">

                                <div
                                  className={`
                                    relative z-10 mt-1.5 h-3 w-3 rounded-full ring-4 ring-white

                                    ${
                                      statusStyles.dot
                                    }
                                  `}
                                />

                                {!isLast && (
                                  <div className="absolute left-1/2 top-4 h-[calc(100%-2px)] w-px -translate-x-1/2 bg-slate-200" />
                                )}

                              </div>

                              {/* TIMELINE CONTENT */}

                              <div
                                className={`min-w-0 flex-1 ${
                                  isLast
                                    ? ""
                                    : "pb-6"
                                }`}
                              >

                                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">

                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                                    <div>

                                      <span
                                        className={`
                                          inline-flex rounded-full px-2.5 py-1 text-xs font-semibold

                                          ${
                                            statusStyles.badge
                                          }
                                        `}
                                      >
                                        {
                                          history.new_status
                                        }
                                      </span>

                                      <p className="mt-2 text-sm font-medium text-slate-700">

                                        {
                                          history.old_status
                                            ? `Changed from ${history.old_status}`
                                            : "Application created"
                                        }

                                      </p>

                                    </div>

                                    <p className="shrink-0 text-xs text-slate-400">
                                      {
                                        formatDateTime(
                                          history.changed_at
                                        )
                                      }
                                    </p>

                                  </div>

                                  {history.notes && (
                                    <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">
                                      {
                                        history.notes
                                      }
                                    </p>
                                  )}

                                </div>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

              </div>

            </section>

            {/* ===================================================
                DATES
            =================================================== */}

            <section>

              <h3 className="text-sm font-bold text-slate-900">
                Dates
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailItem
                  label="Date applied"
                  value={
                    formatDate(
                      application.date_applied
                    )
                  }
                />

                <DetailItem
                  label="Deadline"
                  value={
                    formatDate(
                      application.deadline
                    )
                  }
                />

                <DetailItem
                  label="Created"
                  value={
                    formatDateTime(
                      application.created_at
                    )
                  }
                />

                <DetailItem
                  label="Last updated"
                  value={
                    formatDateTime(
                      application.updated_at
                    )
                  }
                />

              </div>

            </section>

            {/* ===================================================
                CONTACT AND LINK
            =================================================== */}

            <section>

              <h3 className="text-sm font-bold text-slate-900">
                Contact and link
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailItem
                  label="Contact person"
                  value={
                    application.contact_person ||
                    "Not set"
                  }
                />

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Job URL
                  </p>

                  {application.job_url ? (
                    <a
                      href={
                        application.job_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Open job posting
                    </a>
                  ) : (
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      Not set
                    </p>
                  )}

                </div>

              </div>

            </section>

            {/* ===================================================
                DESCRIPTION
            =================================================== */}

            <section>

              <h3 className="text-sm font-bold text-slate-900">
                Description
              </h3>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {
                    application.description ||
                    "No description added."
                  }
                </p>

              </div>

            </section>

            {/* ===================================================
                NOTES
            =================================================== */}

            <section>

              <h3 className="text-sm font-bold text-slate-900">
                Notes
              </h3>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {
                    application.notes ||
                    "No notes added."
                  }
                </p>

              </div>

            </section>

            {/* ===================================================
                FOOTER
            =================================================== */}

            <div className="flex justify-end border-t border-slate-100 pt-5">

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          CREATE INTERVIEW MODAL
      ===================================================== */}

      {showInterviewForm &&
        !interviewToEdit && (
          <InterviewForm
            application={
              application
            }

            onClose={
              handleCloseCreateInterview
            }

            onCreated={
              handleInterviewCreated
            }
          />
        )}

      {/* =====================================================
          EDIT INTERVIEW MODAL
      ===================================================== */}

      {interviewToEdit && (
        <InterviewForm
          application={
            application
          }

          interview={
            interviewToEdit
          }

          onClose={
            handleCloseEditInterview
          }

          onUpdated={
            handleInterviewUpdated
          }
        />
      )}

    </>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-slate-700">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   MINI DETAIL ITEM
========================================================= */

type MiniDetailItemProps = {
  label: string;
  value: string;
};

function MiniDetailItem({
  label,
  value,
}: MiniDetailItemProps) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value}
      </p>

    </div>
  );
}

export default ApplicationDetailsModal;