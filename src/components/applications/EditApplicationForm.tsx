import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  updateApplication,
  type Application,
  type CreateApplicationData,
} from "../../services/applicationService";

import {
  getResumes,
  type Resume,
} from "../../services/resumeService";

type EditApplicationFormProps = {
  application: Application;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

function EditApplicationForm({
  application,
  onClose,
  onUpdated,
}: EditApplicationFormProps) {
  /* =========================================================
     APPLICATION STATE
  ========================================================= */

  const [company, setCompany] =
    useState(application.company);

  const [jobTitle, setJobTitle] =
    useState(application.job_title);

  const [location, setLocation] =
    useState(
      application.location || ""
    );

  const [jobUrl, setJobUrl] =
    useState(
      application.job_url || ""
    );

  const [salary, setSalary] =
    useState(
      application.salary || ""
    );

  const [
    employmentType,
    setEmploymentType,
  ] = useState(
    application.employment_type ||
      "Full-time"
  );

  const [
    description,
    setDescription,
  ] = useState(
    application.description || ""
  );

  const [
    dateApplied,
    setDateApplied,
  ] = useState(
    application.date_applied
      ? application.date_applied.slice(
          0,
          10
        )
      : ""
  );

  const [deadline, setDeadline] =
    useState(
      application.deadline
        ? application.deadline.slice(
            0,
            10
          )
        : ""
    );

  const [status, setStatus] =
    useState(application.status);

  const [notes, setNotes] =
    useState(
      application.notes || ""
    );

  const [
    interviewDate,
    setInterviewDate,
  ] = useState(
    application.interview_date
      ? application.interview_date.slice(
          0,
          16
        )
      : ""
  );

  const [
    contactPerson,
    setContactPerson,
  ] = useState(
    application.contact_person || ""
  );

  /* =========================================================
     RESUME STATE
  ========================================================= */

  const [resumes, setResumes] =
    useState<Resume[]>([]);

  const [
    selectedResumeId,
    setSelectedResumeId,
  ] = useState(
    application.resume_id
      ? String(
          application.resume_id
        )
      : ""
  );

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

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* =========================================================
     LOAD USER RESUMES
  ========================================================= */

  useEffect(() => {
    const loadResumes = async () => {
      try {
        setLoadingResumes(true);
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
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, []);

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !company.trim() ||
      !jobTitle.trim()
    ) {
      setError(
        "Company and job title are required."
      );

      toast.error("Company and job title are required.");

      return;
    }

    if (jobUrl.trim()) {
      try {
        new URL(jobUrl.trim());
      } catch {
        const message = "Please enter a valid job URL.";
        setError(message);
        toast.error(message);
        return;
      }
    }

    if (dateApplied && deadline && deadline < dateApplied) {
      const message = "The deadline cannot be earlier than the application date.";
      setError(message);
      toast.error(message);
      return;
    }

    setError("");

    const applicationData:
      CreateApplicationData = {
        company:
          company.trim(),

        job_title:
          jobTitle.trim(),

        location:
          location.trim(),

        job_url:
          jobUrl.trim(),

        salary:
          salary.trim(),

        employment_type:
          employmentType,

        description:
          description.trim(),

        date_applied:
          dateApplied,

        deadline,

        status,

        notes:
          notes.trim(),

        interview_date:
          interviewDate,

        contact_person:
          contactPerson.trim(),

        resume_id:
          selectedResumeId
            ? Number(
                selectedResumeId
              )
            : null,
      };

    try {
      setLoading(true);

      await updateApplication(
        application.id,
        applicationData
      );

      await onUpdated();
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );

        toast.error(error.message);
      } else {
        setError(
          "Failed to update application."
        );

        toast.error("Failed to update application.");
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

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Edit Application
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your job application details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100"
            aria-label="Close form"
          >
            ×
          </button>

        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ===================================================
              BASIC INFORMATION
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Basic information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* COMPANY */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company *
                </label>

                <input
                  type="text"
                  value={company}
                  onChange={(e) =>
                    setCompany(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* JOB TITLE */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Job title *
                </label>

                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) =>
                    setJobTitle(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* SALARY */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Salary
                </label>

                <input
                  type="text"
                  value={salary}
                  onChange={(e) =>
                    setSalary(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>

          {/* ===================================================
              JOB DETAILS
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Job details
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* EMPLOYMENT TYPE */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Employment type
                </label>

                <select
                  value={
                    employmentType
                  }
                  onChange={(e) =>
                    setEmploymentType(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

                  <option value="Freelance">
                    Freelance
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Saved">
                    Saved
                  </option>

                  <option value="Applied">
                    Applied
                  </option>

                  <option value="Screening">
                    Screening
                  </option>

                  <option value="Interview">
                    Interview
                  </option>

                  <option value="Technical Interview">
                    Technical Interview
                  </option>

                  <option value="Final Interview">
                    Final Interview
                  </option>

                  <option value="Offer">
                    Offer
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                  <option value="Withdrawn">
                    Withdrawn
                  </option>
                </select>
              </div>

              {/* =================================================
                  RESUME USED
              ================================================= */}

              <div className="sm:col-span-2">

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Resume used
                </label>

                <select
                  value={
                    selectedResumeId
                  }
                  onChange={(e) =>
                    setSelectedResumeId(
                      e.target.value
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
                      (resume) => (
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
                    <p className="mt-2 text-xs text-slate-500">
                      You do not have any resumes yet. This application can remain without an attached resume.
                    </p>
                  )}

                {!loadingResumes &&
                  !resumeError &&
                  resumes.length >
                    0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Select the resume used for this application, or choose no resume to remove the relationship.
                    </p>
                  )}

              </div>

              {/* JOB URL */}

              <div className="sm:col-span-2">

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Job URL
                </label>

                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) =>
                    setJobUrl(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* DATE APPLIED */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date applied
                </label>

                <input
                  type="date"
                  value={
                    dateApplied
                  }
                  onChange={(e) =>
                    setDateApplied(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* DEADLINE */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Deadline
                </label>

                <input
                  type="date"
                  value={deadline}
                  onChange={(e) =>
                    setDeadline(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>

          {/* ===================================================
              ADDITIONAL DETAILS
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Additional details
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* INTERVIEW DATE */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Interview date
                </label>

                <input
                  type="datetime-local"
                  value={
                    interviewDate
                  }
                  onChange={(e) =>
                    setInterviewDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* CONTACT PERSON */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contact person
                </label>

                <input
                  type="text"
                  value={
                    contactPerson
                  }
                  onChange={(e) =>
                    setContactPerson(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="sm:col-span-2">

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* NOTES */}

              <div className="sm:col-span-2">

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

              </div>

            </div>

          </section>

          {/* ===================================================
              BUTTONS
          =================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Saving changes..."
                : "Save changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditApplicationForm;