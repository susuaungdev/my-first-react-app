import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  createApplication,
  type CreateApplicationData,
} from "../../services/applicationService";

import {
  getResumes,
  type Resume,
} from "../../services/resumeService";

/* =========================================================
   TYPES
========================================================= */

type ApplicationFormProps = {
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

/* =========================================================
   APPLICATION STATUS OPTIONS
========================================================= */

const applicationStatuses = [
  "Saved",
  "Applied",
  "Screening",
  "Interview",
  "Technical Interview",
  "Final Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

/* =========================================================
   EMPLOYMENT TYPE OPTIONS
========================================================= */

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Other",
];

/* =========================================================
   LOCAL DATE HELPER

   Avoids using toISOString(), because UTC conversion can
   accidentally produce yesterday/tomorrow for some users.
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
   APPLICATION FORM
========================================================= */

function ApplicationForm({
  onClose,
  onCreated,
}: ApplicationFormProps) {
  /* =========================================================
     QUICK ADD STATE
  ========================================================= */

  const [
    company,
    setCompany,
  ] = useState("");

  const [
    jobTitle,
    setJobTitle,
  ] = useState("");

  /*
   * Most records created from the Applications page will be
   * jobs the user has already applied to.
   */
  const [
    status,
    setStatus,
  ] = useState("Applied");

  const [
    dateApplied,
    setDateApplied,
  ] = useState(
    getTodayLocalDate()
  );

  /* =========================================================
     OPTIONAL JOB DETAILS
  ========================================================= */

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    employmentType,
    setEmploymentType,
  ] = useState(
    "Full-time"
  );

  const [
    salary,
    setSalary,
  ] = useState("");

  const [
    jobUrl,
    setJobUrl,
  ] = useState("");

  const [
    deadline,
    setDeadline,
  ] = useState("");

  const [
    contactPerson,
    setContactPerson,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  /* =========================================================
     MORE DETAILS VISIBILITY
  ========================================================= */

  const [
    showMoreDetails,
    setShowMoreDetails,
  ] = useState(false);

  /* =========================================================
     RESUME STATE
  ========================================================= */

  const [
    resumes,
    setResumes,
  ] = useState<Resume[]>([]);

  const [
    selectedResumeId,
    setSelectedResumeId,
  ] = useState("");

  const [
    loadingResumes,
    setLoadingResumes,
  ] = useState(true);

  const [
    resumeError,
    setResumeError,
  ] = useState("");

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =========================================================
     LOAD USER RESUMES
  ========================================================= */

  useEffect(() => {
    const loadResumes =
      async () => {
        try {
          setLoadingResumes(
            true
          );

          setResumeError("");

          const data =
            await getResumes();

          setResumes(
            data.resumes || []
          );
        } catch (error) {
          console.error(
            "Failed to load resumes:",
            error
          );

          if (
            error instanceof Error
          ) {
            setResumeError(
              error.message
            );
          } else {
            setResumeError(
              "Failed to load resumes."
            );
          }
        } finally {
          setLoadingResumes(
            false
          );
        }
      };

    loadResumes();
  }, []);

  /* =========================================================
     STATUS CHANGE

     Smart default:
     - If changing to Applied and date is empty, fill today.
     - Saved jobs don't need an application date.
  ========================================================= */

  const handleStatusChange = (
    newStatus: string
  ) => {
    setStatus(
      newStatus
    );

    if (
      newStatus === "Saved"
    ) {
      /*
       * A Saved application may not have been applied to yet.
       */
      setDateApplied("");
      return;
    }

    if (
      !dateApplied
    ) {
      setDateApplied(
        getTodayLocalDate()
      );
    }
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
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

        /*
         * Open the optional section so the user can immediately
         * see and correct the invalid field.
         */
        setShowMoreDetails(
          true
        );

        return false;
      }
    }

    if (
      dateApplied &&
      deadline &&
      deadline < dateApplied
    ) {
      const message =
        "The deadline cannot be earlier than the application date.";

      setError(message);
      toast.error(message);

      setShowMoreDetails(
        true
      );

      return false;
    }

    setError("");

    return true;
  };

  /* =========================================================
     SUBMIT APPLICATION
  ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !validateForm()
    ) {
      return;
    }

    const applicationData:
      CreateApplicationData = {
        company:
          company.trim(),

        job_title:
          jobTitle.trim(),

        status,

        date_applied:
          status === "Saved"
            ? ""
            : dateApplied,

        location:
          location.trim(),

        employment_type:
          employmentType,

        salary:
          salary.trim(),

        job_url:
          jobUrl.trim(),

        deadline,

        contact_person:
          contactPerson.trim(),

        description:
          description.trim(),

        notes:
          notes.trim(),

        resume_id:
          selectedResumeId
            ? Number(
                selectedResumeId
              )
            : null,
      };

    try {
      setLoading(true);
      setError("");

      await createApplication(
        applicationData
      );

      toast.success(
        "Application added successfully."
      );

      await onCreated();
    } catch (error) {
      console.error(
        "Failed to create application:",
        error
      );

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );

        toast.error(
          error.message
        );
      } else {
        const message =
          "Failed to create application.";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div className="min-w-0">

            <h2 className="text-xl font-bold text-slate-900">
              Add Application
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track a job in just a few seconds.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close form"
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
              QUICK ADD
          =================================================== */}

          <section>

            <div>

              <h3 className="text-sm font-bold text-slate-900">
                Application
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Only the company and job title are required.
                You can add everything else later.
              </p>

            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* COMPANY */}

              <div>

                <label
                  htmlFor="application-company"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Company
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="application-company"
                  type="text"
                  value={company}
                  onChange={(
                    event
                  ) =>
                    setCompany(
                      event.target.value
                    )
                  }
                  placeholder="Google"
                  autoFocus
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* JOB TITLE */}

              <div>

                <label
                  htmlFor="application-job-title"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Job title
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="application-job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(
                    event
                  ) =>
                    setJobTitle(
                      event.target.value
                    )
                  }
                  placeholder="Frontend Developer"
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* STATUS */}

              <div>

                <label
                  htmlFor="application-status"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Status
                </label>

                <select
                  id="application-status"
                  value={status}
                  onChange={(
                    event
                  ) =>
                    handleStatusChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {applicationStatuses.map(
                    (
                      applicationStatus
                    ) => (
                      <option
                        key={
                          applicationStatus
                        }
                        value={
                          applicationStatus
                        }
                      >
                        {
                          applicationStatus
                        }
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* DATE APPLIED */}

              <div>

                <label
                  htmlFor="application-date-applied"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Date applied
                </label>

                <input
                  id="application-date-applied"
                  type="date"
                  value={
                    dateApplied
                  }
                  disabled={
                    status === "Saved"
                  }
                  onChange={(
                    event
                  ) =>
                    setDateApplied(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                />

                {status ===
                  "Saved" && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    No application date is needed while this job is saved.
                  </p>
                )}

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
              aria-expanded={
                showMoreDetails
              }
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:border-slate-300 hover:bg-slate-100"
            >

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  {showMoreDetails
                    ? "Hide additional details"
                    : "Add more details"}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Location, salary, job URL, resume, deadline and notes.
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
                  Everything below is optional. Add only what is useful
                  for tracking this opportunity.
                </p>

              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* LOCATION */}

                <div>

                  <label
                    htmlFor="application-location"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Location
                  </label>

                  <input
                    id="application-location"
                    type="text"
                    value={location}
                    onChange={(
                      event
                    ) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    placeholder="Remote, Yangon, London..."
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* EMPLOYMENT TYPE */}

                <div>

                  <label
                    htmlFor="application-employment-type"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Employment type
                  </label>

                  <select
                    id="application-employment-type"
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

                <div>

                  <label
                    htmlFor="application-salary"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Salary
                  </label>

                  <input
                    id="application-salary"
                    type="text"
                    value={salary}
                    onChange={(
                      event
                    ) =>
                      setSalary(
                        event.target.value
                      )
                    }
                    placeholder="$80,000 / year"
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* DEADLINE */}

                <div>

                  <label
                    htmlFor="application-deadline"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Application deadline
                  </label>

                  <input
                    id="application-deadline"
                    type="date"
                    value={deadline}
                    onChange={(
                      event
                    ) =>
                      setDeadline(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* JOB URL */}

                <div className="sm:col-span-2">

                  <label
                    htmlFor="application-job-url"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Job URL
                  </label>

                  <input
                    id="application-job-url"
                    type="url"
                    value={jobUrl}
                    onChange={(
                      event
                    ) =>
                      setJobUrl(
                        event.target.value
                      )
                    }
                    placeholder="https://company.com/jobs/..."
                    maxLength={2048}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* RESUME USED */}

                <div className="sm:col-span-2">

                  <label
                    htmlFor="application-resume"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Resume used
                  </label>

                  <select
                    id="application-resume"
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
                      {resumeError}
                    </p>
                  )}

                  {!loadingResumes &&
                    !resumeError &&
                    resumes.length ===
                      0 && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        You don't have a resume yet. That's okay —
                        create the application now and attach one later.
                      </p>
                    )}

                  {!loadingResumes &&
                    !resumeError &&
                    resumes.length >
                      0 && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Select the resume you used for this application,
                        if applicable.
                      </p>
                    )}

                </div>

                {/* CONTACT PERSON */}

                <div className="sm:col-span-2">

                  <label
                    htmlFor="application-contact"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Contact person
                  </label>

                  <input
                    id="application-contact"
                    type="text"
                    value={
                      contactPerson
                    }
                    onChange={(
                      event
                    ) =>
                      setContactPerson(
                        event.target.value
                      )
                    }
                    placeholder="Recruiter or hiring manager name"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="sm:col-span-2">

                  <label
                    htmlFor="application-description"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Job description
                  </label>

                  <textarea
                    id="application-description"
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
                    rows={4}
                    maxLength={10000}
                    placeholder="Paste the job description or important role details..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* NOTES */}

                <div className="sm:col-span-2">

                  <label
                    htmlFor="application-notes"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id="application-notes"
                    value={notes}
                    onChange={(
                      event
                    ) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    rows={3}
                    maxLength={10000}
                    placeholder="Anything you want to remember about this application..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>

            </section>
          )}

          {/* ===================================================
              ACTIONS
          =================================================== */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

            <p className="hidden text-xs text-slate-400 sm:block">
              You can edit these details anytime.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-w-40 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Adding application..."
                  : "Add Application"}
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ApplicationForm;