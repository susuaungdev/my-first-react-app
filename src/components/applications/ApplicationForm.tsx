import { useState } from "react";

import {
  createApplication,
  type CreateApplicationData,
} from "../../services/applicationService";

type ApplicationFormProps = {
  onClose: () => void;
  onCreated: () => void;
};

function ApplicationForm({
  onClose,
  onCreated,
}: ApplicationFormProps) {
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [salary, setSalary] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [dateApplied, setDateApplied] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Saved");
  const [notes, setNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!company || !jobTitle) {
      setError(
        "Company and job title are required."
      );
      return;
    }

    setError("");

    const applicationData: CreateApplicationData = {
      company,
      job_title: jobTitle,
      location,
      job_url: jobUrl,
      salary,
      employment_type: employmentType,
      description,
      date_applied: dateApplied,
      deadline,
      status,
      notes,
      interview_date: interviewDate,
      contact_person: contactPerson,
    };

    try {
      setLoading(true);

      await createApplication(
        applicationData
      );

      onCreated();
      onClose();

    } catch (error) {

      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to create application."
        );
      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Add Application
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a job opportunity to your CareerFlow tracker.
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


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {/* Basic Information */}
          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Basic information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company *
                </label>

                <input
                  type="text"
                  value={company}
                  onChange={(e) =>
                    setCompany(e.target.value)
                  }
                  placeholder="Google"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Job title *
                </label>

                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) =>
                    setJobTitle(e.target.value)
                  }
                  placeholder="Frontend Developer"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Remote"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Salary
                </label>

                <input
                  type="text"
                  value={salary}
                  onChange={(e) =>
                    setSalary(e.target.value)
                  }
                  placeholder="$80,000"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>


          {/* Job Details */}
          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Job details
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Employment type
                </label>

                <select
                  value={employmentType}
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


              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
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


              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Job URL
                </label>

                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) =>
                    setJobUrl(e.target.value)
                  }
                  placeholder="https://company.com/jobs/..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date applied
                </label>

                <input
                  type="date"
                  value={dateApplied}
                  onChange={(e) =>
                    setDateApplied(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Deadline
                </label>

                <input
                  type="date"
                  value={deadline}
                  onChange={(e) =>
                    setDeadline(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>


          {/* Additional Details */}
          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Additional details
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Interview date
                </label>

                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) =>
                    setInterviewDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contact person
                </label>

                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) =>
                    setContactPerson(
                      e.target.value
                    )
                  }
                  placeholder="Recruiter name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Job description or important details..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  rows={3}
                  placeholder="Personal notes about this application..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>


          {/* Buttons */}
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
                ? "Adding application..."
                : "Add Application"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ApplicationForm;