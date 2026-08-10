import {
  useMemo,
  useState,
} from "react";

import {
  createInterview,
  type CreateInterviewData,
} from "../../services/interviewService";

import type {
  Application,
} from "../../services/applicationService";

type InterviewFormProps = {
  application: Application;
  onClose: () => void;
  onCreated: () => void;
};

const interviewTypes = [
  "Recruiter Screen",
  "HR Interview",
  "Technical Interview",
  "Coding Interview",
  "Hiring Manager",
  "Final Interview",
  "Other",
];

const interviewResults = [
  "Pending",
  "Passed",
  "Failed",
  "Offer",
  "Cancelled",
];

function InterviewForm({
  application,
  onClose,
  onCreated,
}: InterviewFormProps) {
  const defaultTimezone =
    useMemo(() => {
      try {
        return Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone;
      } catch {
        return "";
      }
    }, []);

  const [
    interviewType,
    setInterviewType,
  ] = useState(
    "Recruiter Screen"
  );

  const [
    scheduledAt,
    setScheduledAt,
  ] = useState("");

  const [
    timezone,
    setTimezone,
  ] = useState(
    defaultTimezone
  );

  const [
    interviewerName,
    setInterviewerName,
  ] = useState("");

  const [
    interviewerEmail,
    setInterviewerEmail,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    meetingUrl,
    setMeetingUrl,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    preparationNotes,
    setPreparationNotes,
  ] = useState("");

  const [
    result,
    setResult,
  ] = useState("Pending");

  const [
    followUpDate,
    setFollowUpDate,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !interviewType.trim()
    ) {
      setError(
        "Interview type is required."
      );

      return;
    }

    if (!scheduledAt) {
      setError(
        "Interview date and time are required."
      );

      return;
    }

    setError("");

    const interviewData:
      CreateInterviewData = {
        application_id:
          application.id,

        interview_type:
          interviewType,

        scheduled_at:
          scheduledAt,

        timezone:
          timezone.trim(),

        interviewer_name:
          interviewerName.trim(),

        interviewer_email:
          interviewerEmail.trim(),

        location:
          location.trim(),

        meeting_url:
          meetingUrl.trim(),

        notes:
          notes.trim(),

        preparation_notes:
          preparationNotes.trim(),

        result,

        follow_up_date:
          followUpDate,
      };

    try {
      setLoading(true);

      await createInterview(
        interviewData
      );

      onCreated();
      onClose();
    } catch (error) {
      console.error(
        "Failed to create interview:",
        error
      );

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );
      } else {
        setError(
          "Failed to create interview."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/50 px-4 py-6">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>
            <p className="text-sm font-semibold text-blue-600">
              Interview management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Add Interview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {application.job_title} at {application.company}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100"
            aria-label="Close interview form"
          >
            ×
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* INTERVIEW DETAILS */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Interview details
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Interview type *
                </label>

                <select
                  value={interviewType}
                  onChange={(e) =>
                    setInterviewType(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {interviewTypes.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date and time *
                </label>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) =>
                    setScheduledAt(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Timezone
                </label>

                <input
                  type="text"
                  value={timezone}
                  onChange={(e) =>
                    setTimezone(
                      e.target.value
                    )
                  }
                  placeholder="Asia/Yangon"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Result
                </label>

                <select
                  value={result}
                  onChange={(e) =>
                    setResult(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {interviewResults.map(
                    (value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {value}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>

          </section>

          {/* INTERVIEWER */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Interviewer
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Interviewer name
                </label>

                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) =>
                    setInterviewerName(
                      e.target.value
                    )
                  }
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Interviewer email
                </label>

                <input
                  type="email"
                  value={interviewerEmail}
                  onChange={(e) =>
                    setInterviewerEmail(
                      e.target.value
                    )
                  }
                  placeholder="jane@company.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>

          {/* LOCATION / MEETING */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Location and meeting
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

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
                  placeholder="Remote / Office / Meeting room"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Meeting URL
                </label>

                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) =>
                    setMeetingUrl(
                      e.target.value
                    )
                  }
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>

          {/* PREPARATION */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Preparation
            </h3>

            <div className="mt-4 space-y-4">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Preparation notes
                </label>

                <textarea
                  rows={4}
                  value={preparationNotes}
                  onChange={(e) =>
                    setPreparationNotes(
                      e.target.value
                    )
                  }
                  placeholder="Topics to review, questions to prepare, company research..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Interview notes
                </label>

                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  placeholder="General notes about this interview..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>

          {/* FOLLOW UP */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Follow-up
            </h3>

            <div className="mt-4">

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Follow-up date
              </label>

              <input
                type="datetime-local"
                value={followUpDate}
                onChange={(e) =>
                  setFollowUpDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:max-w-sm"
              />

              <p className="mt-2 text-xs text-slate-500">
                Use this for recruiter follow-ups or thank-you reminders.
              </p>

            </div>

          </section>

          {/* BUTTONS */}

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
                ? "Adding interview..."
                : "Add Interview"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default InterviewForm;