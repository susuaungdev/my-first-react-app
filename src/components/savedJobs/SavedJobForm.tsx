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
  ) => void;

  onUpdated?: (
    savedJob: SavedJob
  ) => void;
};

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
     FORM STATE
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
    jobUrl,
    setJobUrl,
  ] = useState(
    savedJob?.job_url ||
      ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    savedJob?.description ||
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

  const [
    notes,
    setNotes,
  ] = useState(
    savedJob?.notes ||
      ""
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
        setError(
          "Company is required."
        );

        toast.error("Company is required.");

        return false;
      }

      if (
        !jobTitle.trim()
      ) {
        setError(
          "Job title is required."
        );

        toast.error("Job title is required.");

        return false;
      }

      if (
        jobUrl.trim()
      ) {
        try {
          new URL(
            jobUrl.trim()
          );
        } catch {
          setError(
            "Please enter a valid job URL."
          );

          toast.error("Please enter a valid job URL.");

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

        location:
          location.trim(),

        salary:
          salary.trim(),

        employment_type:
          employmentType,

        job_url:
          jobUrl.trim(),

        description:
          description.trim(),

        deadline,

        notes:
          notes.trim(),
      };

      try {
        setLoading(true);

        setError("");

        /* =====================================================
           EDIT EXISTING JOB
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
           CREATE NEW JOB
        ===================================================== */

        const response =
          await createSavedJob(
            payload
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

          toast.error(error.message);
        } else {
          const message = isEditMode
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

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Saved jobs
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {isEditMode
                ? "Edit Saved Job"
                : "Save a Job"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep interesting opportunities organized before you apply.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close saved job form"
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
          className="space-y-6 p-6"
        >

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ===================================================
              JOB INFORMATION
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Job information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* COMPANY */}

              <div>

                <label
                  htmlFor="saved-job-company"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Company *
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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              {/* JOB TITLE */}

              <div>

                <label
                  htmlFor="saved-job-title"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Job title *
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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              {/* SALARY */}

              <div>

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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
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

                  <option value="Full-time">
                    Full-time
                  </option>

                  <option value="Part-time">
                    Part-time
                  </option>

                  <option value="Contract">
                    Contract
                  </option>

                  <option value="Internship">
                    Internship
                  </option>

                  <option value="Temporary">
                    Temporary
                  </option>

                  <option value="Freelance">
                    Freelance
                  </option>

                </select>

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
              JOB URL
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Job posting
            </h3>

            <div className="mt-4">

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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

            </div>

          </section>

          {/* ===================================================
              DESCRIPTION
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Description
            </h3>

            <div className="mt-4">

              <textarea
                rows={5}
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
                placeholder="Paste important details, responsibilities, requirements, or anything you want to remember..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

            </div>

          </section>

          {/* ===================================================
              NOTES
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Personal notes
            </h3>

            <div className="mt-4">

              <textarea
                rows={4}
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
                placeholder="Why you're interested, people to contact, preparation ideas..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

            </div>

          </section>

          {/* ===================================================
              BUTTONS
          =================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

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
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

        </form>

      </div>

    </div>
  );
}

export default SavedJobForm;