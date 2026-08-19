import {
  useEffect,
  useState,
} from "react";

import {
  getResumes,
  type Resume,
} from "../../services/resumeService";

import type {
  SavedJob,
} from "../../services/savedJobService";

/* =========================================================
   TYPES
========================================================= */

export type MarkAsAppliedData = {
  dateApplied: string;
  resumeId: number | null;
  removeFromSavedJobs: boolean;
};

type MarkAsAppliedModalProps = {
  savedJob: SavedJob;

  loading?: boolean;

  onClose: () => void;

  onConfirm: (
    data: MarkAsAppliedData
  ) => void | Promise<void>;
};

/* =========================================================
   LOCAL DATE HELPER
========================================================= */

const getTodayLocalDate = () => {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

/* =========================================================
   MARK AS APPLIED MODAL
========================================================= */

function MarkAsAppliedModal({
  savedJob,
  loading = false,
  onClose,
  onConfirm,
}: MarkAsAppliedModalProps) {
  /* =========================================================
     APPLICATION DETAILS
  ========================================================= */

  const [
    dateApplied,
    setDateApplied,
  ] = useState(
    getTodayLocalDate()
  );

  const [
    selectedResumeId,
    setSelectedResumeId,
  ] = useState("");

  const [
    removeFromSavedJobs,
    setRemoveFromSavedJobs,
  ] = useState(true);

  /* =========================================================
     RESUME STATE
  ========================================================= */

  const [
    resumes,
    setResumes,
  ] =
    useState<Resume[]>([]);

  const [
    loadingResumes,
    setLoadingResumes,
  ] = useState(true);

  const [
    resumeError,
    setResumeError,
  ] = useState("");

  /* =========================================================
     FORM ERROR
  ========================================================= */

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     LOAD RESUMES
  ========================================================= */

  useEffect(() => {
    let active = true;

    const loadResumes =
      async () => {
        try {
          setLoadingResumes(
            true
          );

          setResumeError("");

          const response =
            await getResumes();

          if (!active) {
            return;
          }

          setResumes(
            response.resumes ||
              []
          );
        } catch (error) {
          console.error(
            "Failed to load resumes:",
            error
          );

          if (!active) {
            return;
          }

          setResumeError(
            error instanceof Error
              ? error.message
              : "Failed to load resumes."
          );
        } finally {
          if (active) {
            setLoadingResumes(
              false
            );
          }
        }
      };

    void loadResumes();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      if (!dateApplied) {
        setError(
          "Please select the date you applied."
        );

        return;
      }

      setError("");

      await onConfirm({
        dateApplied,

        resumeId:
          selectedResumeId
            ? Number(
                selectedResumeId
              )
            : null,

        removeFromSavedJobs,
      });
    };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/50 px-4 py-6">

      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div className="min-w-0">

            <p className="text-sm font-semibold text-blue-600">
              Saved job
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Mark as Applied
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Move this opportunity into your application tracker.
            </p>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              loading
            }
            aria-label="Close mark as applied modal"
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>

        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={
            handleSubmit
          }
          className="p-6"
        >

          {/* ===================================================
              JOB SUMMARY
          =================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
              💼
            </div>

            <h3 className="mt-3 break-words text-base font-bold text-slate-900">
              {
                savedJob.job_title
              }
            </h3>

            <p className="mt-1 break-words text-sm font-semibold text-blue-600">
              {
                savedJob.company
              }
            </p>

            {(savedJob.location ||
              savedJob.employment_type) && (
              <div className="mt-3 flex flex-wrap gap-2">

                {savedJob.location && (
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm">
                    {
                      savedJob.location
                    }
                  </span>
                )}

                {savedJob.employment_type && (
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm">
                    {
                      savedJob.employment_type
                    }
                  </span>
                )}

              </div>
            )}

          </div>

          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ===================================================
              DATE APPLIED
          =================================================== */}

          <div className="mt-5">

            <label
              htmlFor="mark-applied-date"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Date applied

              <span className="ml-1 text-red-500">
                *
              </span>

            </label>

            <input
              id="mark-applied-date"
              type="date"
              value={
                dateApplied
              }
              onChange={(
                event
              ) =>
                setDateApplied(
                  event.target.value
                )
              }
              disabled={
                loading
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Today is selected automatically. Change it if you
              applied on another date.
            </p>

          </div>

          {/* ===================================================
              RESUME
          =================================================== */}

          <div className="mt-5">

            <label
              htmlFor="mark-applied-resume"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Resume used
            </label>

            <select
              id="mark-applied-resume"
              value={
                selectedResumeId
              }
              onChange={(
                event
              ) =>
                setSelectedResumeId(
                  event.target.value
                )
              }
              disabled={
                loading ||
                loadingResumes
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >

              <option value="">
                {loadingResumes
                  ? "Loading resumes..."
                  : "No resume selected"}
              </option>

              {!loadingResumes &&
                resumes.map(
                  (
                    resume
                  ) => (
                    <option
                      key={
                        resume.id
                      }
                      value={
                        resume.id
                      }
                    >
                      {
                        resume.title
                      }
                    </option>
                  )
                )}

            </select>

            {resumeError && (
              <p className="mt-2 text-xs text-red-600">
                {
                  resumeError
                }
              </p>
            )}

            {!loadingResumes &&
              !resumeError &&
              resumes.length ===
                0 && (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  You don't have a resume yet. You can still mark
                  this job as applied and attach a resume later.
                </p>
              )}

            {!loadingResumes &&
              !resumeError &&
              resumes.length >
                0 && (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Optional — choose the resume you submitted for
                  this application.
                </p>
              )}

          </div>

          {/* ===================================================
              REMOVE FROM SAVED JOBS
          =================================================== */}

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">

            <input
              type="checkbox"
              checked={
                removeFromSavedJobs
              }
              onChange={(
                event
              ) =>
                setRemoveFromSavedJobs(
                  event.target.checked
                )
              }
              disabled={
                loading
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />

            <div className="min-w-0">

              <p className="text-sm font-semibold text-slate-800">
                Remove from Saved Jobs
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Recommended. After the application is created,
                this opportunity will be removed from Saved Jobs.
              </p>

            </div>

          </label>

          {/* ===================================================
              AUTO TRANSFER INFO
          =================================================== */}

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

            <div className="flex gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
                ✓
              </div>

              <div>

                <p className="text-sm font-semibold text-blue-900">
                  Job details transfer automatically
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Company, job title, location, salary, employment
                  type, job URL, description, deadline and notes
                  will be copied to your application.
                </p>

              </div>

            </div>

          </div>

          {/* ===================================================
              ACTIONS
          =================================================== */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                loading
              }
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading
              }
              className="inline-flex min-w-40 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating application..."
                : "Mark as Applied"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default MarkAsAppliedModal;