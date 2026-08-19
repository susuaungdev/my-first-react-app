import {
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  createSavedJob,
  updateSavedJob,
  type SavedJob,
  type SavedJobData,
} from "../../services/savedJobService";

/* =========================================================
   PROPS
========================================================= */

type SavedJobFormProps = {
  savedJob?: SavedJob | null;

  onClose: () => void;

  onCreated?: (
    savedJob: SavedJob
  ) => void | Promise<void>;

  onUpdated?: (
    savedJob: SavedJob
  ) => void | Promise<void>;
};

/* =========================================================
   EMPLOYMENT TYPES
========================================================= */

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
  "Freelance",
  "Other",
];

/* =========================================================
   SAVED JOB FORM
========================================================= */

function SavedJobForm({
  savedJob = null,
  onClose,
  onCreated,
  onUpdated,
}: SavedJobFormProps) {
  const isEditMode =
    Boolean(savedJob);

  /* =========================================================
     QUICK SAVE STATE
  ========================================================= */

  const [
    company,
    setCompany,
  ] = useState(
    savedJob?.company ||
      ""
  );

  const [
    jobTitle,
    setJobTitle,
  ] = useState(
    savedJob?.job_title ||
      ""
  );

  const [
    jobUrl,
    setJobUrl,
  ] = useState(
    savedJob?.job_url ||
      ""
  );

  const [
    deadline,
    setDeadline,
  ] = useState(
    savedJob?.deadline
      ? savedJob.deadline.slice(
          0,
          10
        )
      : ""
  );

  /* =========================================================
     OPTIONAL DETAILS
  ========================================================= */

  const [
    location,
    setLocation,
  ] = useState(
    savedJob?.location ||
      ""
  );

  const [
    salary,
    setSalary,
  ] = useState(
    savedJob?.salary ||
      ""
  );

  const [
    employmentType,
    setEmploymentType,
  ] = useState(
    savedJob?.employment_type ||
      "Full-time"
  );

  const [
    description,
    setDescription,
  ] = useState(
    savedJob?.description ||
      ""
  );

  const [
    notes,
    setNotes,
  ] = useState(
    savedJob?.notes ||
      ""
  );

  /* =========================================================
     MORE DETAILS VISIBILITY
  ========================================================= */

  const [
    showMoreDetails,
    setShowMoreDetails,
  ] = useState(
    /*
     * When editing an existing saved job, open the optional
     * details automatically if the job already contains any.
     */
    Boolean(
      savedJob?.location ||
      savedJob?.salary ||
      savedJob?.employment_type ||
      savedJob?.description ||
      savedJob?.notes
    )
  );

  /* =========================================================
     FORM STATUS
  ========================================================= */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm =
    () => {
      if (
        !company.trim()
      ) {
        const message =
          "Company is required.";

        setError(message);
        toast.error(message);

        return false;
      }

      if (
        !jobTitle.trim()
      ) {
        const message =
          "Job title is required.";

        setError(message);
        toast.error(message);

        return false;
      }

      if (
        jobUrl.trim()
      ) {
        try {
          const parsedUrl =
            new URL(
              jobUrl.trim()
            );

          if (
            ![
              "http:",
              "https:",
            ].includes(
              parsedUrl.protocol
            )
          ) {
            throw new Error();
          }
        } catch {
          const message =
            "Please enter a valid job URL.";

          setError(message);
          toast.error(message);

          return false;
        }
      }

      setError("");

      return true;
    };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      if (
        !validateForm()
      ) {
        return;
      }

      const payload:
        SavedJobData = {
        company:
          company.trim(),

        job_title:
          jobTitle.trim(),

        job_url:
          jobUrl.trim(),

        deadline,

        location:
          location.trim(),

        salary:
          salary.trim(),

        employment_type:
          employmentType,

        description:
          description.trim(),

        notes:
          notes.trim(),
      };

      try {
        setLoading(true);
        setError("");

        /* =====================================================
           UPDATE EXISTING SAVED JOB
        ===================================================== */

        if (
          isEditMode &&
          savedJob
        ) {
          const response =
            await updateSavedJob(
              savedJob.id,
              payload
            );

          toast.success(
            "Saved job updated."
          );

          if (
            onUpdated
          ) {
            await onUpdated(
              response.savedJob
            );
          } else {
            onClose();
          }

          return;
        }

        /* =====================================================
           CREATE SAVED JOB
        ===================================================== */

        const response =
          await createSavedJob(
            payload
          );

        toast.success(
          "Job saved successfully."
        );

        if (
          onCreated
        ) {
          await onCreated(
            response.savedJob
          );
        } else {
          onClose();
        }

      } catch (error) {
        console.error(
          isEditMode
            ? "Failed to update saved job:"
            : "Failed to create saved job:",
          error
        );

        if (
          error instanceof
          Error
        ) {
          setError(
            error.message
          );

          toast.error(
            error.message
          );
        } else {
          const message =
            isEditMode
              ? "Failed to update saved job."
              : "Failed to save job.";

          setError(message);

          toast.error(message);
        }

      } finally {
        setLoading(false);
      }
    };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/50 px-4 py-6">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div className="min-w-0">

            <p className="text-sm font-semibold text-blue-600">
              Saved jobs
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {isEditMode
                ? "Edit Saved Job"
                : "Save a Job"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Update the opportunity details you want to remember."
                : "Save an opportunity now and add more details later."}
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
            aria-label="Close saved job form"
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
              ERROR
          =================================================== */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ===================================================
              QUICK SAVE
          =================================================== */}

          <section>

            <div>

              <h3 className="text-sm font-bold text-slate-900">
                Job opportunity
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Company and job title are the only required fields.
              </p>

            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* COMPANY */}

              <div>

                <label
                  htmlFor="saved-job-company"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Company

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>

                <input
                  id="saved-job-company"
                  type="text"
                  value={
                    company
                  }
                  onChange={(
                    event
                  ) =>
                    setCompany(
                      event.target.value
                    )
                  }
                  disabled={
                    loading
                  }
                  placeholder="Google"
                  autoFocus={
                    !isEditMode
                  }
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              {/* JOB TITLE */}

              <div>

                <label
                  htmlFor="saved-job-title"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Job title

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>

                <input
                  id="saved-job-title"
                  type="text"
                  value={
                    jobTitle
                  }
                  onChange={(
                    event
                  ) =>
                    setJobTitle(
                      event.target.value
                    )
                  }
                  disabled={
                    loading
                  }
                  placeholder="Frontend Developer"
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              {/* JOB URL */}

              <div className="sm:col-span-2">

                <label
                  htmlFor="saved-job-url"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Job URL
                </label>

                <input
                  id="saved-job-url"
                  type="url"
                  value={
                    jobUrl
                  }
                  onChange={(
                    event
                  ) =>
                    setJobUrl(
                      event.target.value
                    )
                  }
                  disabled={
                    loading
                  }
                  placeholder="https://company.com/jobs/..."
                  maxLength={2048}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Save the original posting so you can return to it later.
                </p>

              </div>

              {/* DEADLINE */}

              <div>

                <label
                  htmlFor="saved-job-deadline"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Application deadline
                </label>

                <input
                  id="saved-job-deadline"
                  type="date"
                  value={
                    deadline
                  }
                  onChange={(
                    event
                  ) =>
                    setDeadline(
                      event.target.value
                    )
                  }
                  disabled={
                    loading
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

            </div>

          </section>

          {/* ===================================================
              MORE DETAILS TOGGLE
          =================================================== */}

          <div className="mt-6 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={() =>
                setShowMoreDetails(
                  (
                    current
                  ) =>
                    !current
                )
              }
              disabled={
                loading
              }
              aria-expanded={
                showMoreDetails
              }
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  {showMoreDetails
                    ? "Hide additional details"
                    : "Add more details"}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Location, salary, employment type, description and notes.
                </p>

              </div>

              <span
                className={`ml-4 text-lg text-slate-500 transition-transform ${
                  showMoreDetails
                    ? "rotate-180"
                    : ""
                }`}
                aria-hidden="true"
              >
                ⌄
              </span>

            </button>

          </div>

          {/* ===================================================
              OPTIONAL DETAILS
          =================================================== */}

          {showMoreDetails && (
            <section className="mt-6">

              <div>

                <h3 className="text-sm font-bold text-slate-900">
                  Additional details
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  These fields are optional. Add only the details that
                  help you compare or remember the opportunity.
                </p>

              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* LOCATION */}

                <div>

                  <label
                    htmlFor="saved-job-location"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Location
                  </label>

                  <input
                    id="saved-job-location"
                    type="text"
                    value={
                      location
                    }
                    onChange={(
                      event
                    ) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    disabled={
                      loading
                    }
                    placeholder="Remote / New York"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                </div>

                {/* EMPLOYMENT TYPE */}

                <div>

                  <label
                    htmlFor="saved-job-employment-type"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Employment type
                  </label>

                  <select
                    id="saved-job-employment-type"
                    value={
                      employmentType
                    }
                    onChange={(
                      event
                    ) =>
                      setEmploymentType(
                        event.target.value
                      )
                    }
                    disabled={
                      loading
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >

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

                {/* SALARY */}

                <div className="sm:col-span-2">

                  <label
                    htmlFor="saved-job-salary"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Salary
                  </label>

                  <input
                    id="saved-job-salary"
                    type="text"
                    value={
                      salary
                    }
                    onChange={(
                      event
                    ) =>
                      setSalary(
                        event.target.value
                      )
                    }
                    disabled={
                      loading
                    }
                    placeholder="$80,000 - $100,000"
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="sm:col-span-2">

                  <label
                    htmlFor="saved-job-description"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Job description
                  </label>

                  <textarea
                    id="saved-job-description"
                    rows={4}
                    value={
                      description
                    }
                    onChange={(
                      event
                    ) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    disabled={
                      loading
                    }
                    maxLength={10000}
                    placeholder="Responsibilities, requirements or important details..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                </div>

                {/* NOTES */}

                <div className="sm:col-span-2">

                  <label
                    htmlFor="saved-job-notes"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Personal notes
                  </label>

                  <textarea
                    id="saved-job-notes"
                    rows={3}
                    value={
                      notes
                    }
                    onChange={(
                      event
                    ) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    disabled={
                      loading
                    }
                    maxLength={10000}
                    placeholder="Why you're interested, questions to research, people to contact..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                </div>

              </div>

            </section>
          )}

          {/* ===================================================
              UX NOTE
          =================================================== */}

          {!isEditMode && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

              <div className="flex gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
                  ♡
                </div>

                <div>

                  <p className="text-sm font-semibold text-blue-900">
                    Save first, decide later
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    You can come back anytime to add more details or
                    convert this saved job into an application.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* ===================================================
              ACTIONS
          =================================================== */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

            <p className="hidden text-xs text-slate-400 sm:block">
              {isEditMode
                ? "Changes will update this saved opportunity."
                : "You can edit this opportunity anytime."}
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">

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
                className="inline-flex min-w-32 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? isEditMode
                    ? "Saving changes..."
                    : "Saving job..."
                  : isEditMode
                  ? "Save Changes"
                  : "Save Job"}
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}

export default SavedJobForm;