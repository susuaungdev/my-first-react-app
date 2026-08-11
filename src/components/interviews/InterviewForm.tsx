import {
  useMemo,
  useState,
} from "react";

import {
  createInterview,
  updateInterview,
  type CreateInterviewData,
  type UpdateInterviewData,
  type Interview,
} from "../../services/interviewService";

import type {
  Application,
} from "../../services/applicationService";

/* =========================================================
   PROPS
========================================================= */

type InterviewFormProps = {
  application: Application;

  interview?: Interview | null;

  onClose: () => void;

  onCreated?: () => void;

  onUpdated?: () => void;
};

/* =========================================================
   INTERVIEW OPTIONS
========================================================= */

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

/* =========================================================
   DATETIME HELPER
========================================================= */

const formatForDateTimeInput = (
  value: string | null | undefined
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    /*
      MySQL might already return:
      YYYY-MM-DDTHH:mm
      or
      YYYY-MM-DD HH:mm:ss
    */

    return value
      .replace(" ", "T")
      .slice(0, 16);
  }

  /*
    Convert Date to local datetime-local value
    rather than UTC.
  */

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  const hours =
    String(
      date.getHours()
    ).padStart(
      2,
      "0"
    );

  const minutes =
    String(
      date.getMinutes()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/* =========================================================
   INTERVIEW FORM
========================================================= */

function InterviewForm({
  application,
  interview = null,
  onClose,
  onCreated,
  onUpdated,
}: InterviewFormProps) {
  /* =========================================================
     MODE
  ========================================================= */

  const isEditMode =
    Boolean(interview);

  /* =========================================================
     DEFAULT TIMEZONE
  ========================================================= */

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

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [
    interviewType,
    setInterviewType,
  ] = useState(
    interview?.interview_type ||
      "Recruiter Screen"
  );

  const [
    scheduledAt,
    setScheduledAt,
  ] = useState(
    formatForDateTimeInput(
      interview?.scheduled_at
    )
  );

  const [
    timezone,
    setTimezone,
  ] = useState(
    interview?.timezone ||
      defaultTimezone
  );

  const [
    interviewerName,
    setInterviewerName,
  ] = useState(
    interview?.interviewer_name ||
      ""
  );

  const [
    interviewerEmail,
    setInterviewerEmail,
  ] = useState(
    interview?.interviewer_email ||
      ""
  );

  const [
    location,
    setLocation,
  ] = useState(
    interview?.location ||
      ""
  );

  const [
    meetingUrl,
    setMeetingUrl,
  ] = useState(
    interview?.meeting_url ||
      ""
  );

  const [
    notes,
    setNotes,
  ] = useState(
    interview?.notes ||
      ""
  );

  const [
    preparationNotes,
    setPreparationNotes,
  ] = useState(
    interview?.preparation_notes ||
      ""
  );

  const [
    result,
    setResult,
  ] = useState(
    interview?.result ||
      "Pending"
  );

  const [
    followUpDate,
    setFollowUpDate,
  ] = useState(
    formatForDateTimeInput(
      interview?.follow_up_date
    )
  );

  /* =========================================================
     FORM STATUS
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
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (
      !interviewType.trim()
    ) {
      setError(
        "Interview type is required."
      );

      return false;
    }

    if (!scheduledAt) {
      setError(
        "Interview date and time are required."
      );

      return false;
    }

    if (
      interviewerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        interviewerEmail.trim()
      )
    ) {
      setError(
        "Please enter a valid interviewer email."
      );

      return false;
    }

    if (
      meetingUrl.trim()
    ) {
      try {
        new URL(
          meetingUrl.trim()
        );
      } catch {
        setError(
          "Please enter a valid meeting URL."
        );

        return false;
      }
    }

    setError("");

    return true;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      /* =====================================================
         EDIT EXISTING INTERVIEW
      ===================================================== */

      if (
        isEditMode &&
        interview
      ) {
        const interviewData:
          UpdateInterviewData = {
            interview_type:
              interviewType.trim(),

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

        await updateInterview(
          interview.id,
          interviewData
        );

        if (onUpdated) {
          await onUpdated();
        }

        onClose();

        return;
      }

      /* =====================================================
         CREATE NEW INTERVIEW
      ===================================================== */

      const interviewData:
        CreateInterviewData = {
          application_id:
            application.id,

          interview_type:
            interviewType.trim(),

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

      await createInterview(
        interviewData
      );

      if (onCreated) {
        await onCreated();
      }

      onClose();
    } catch (error) {
      console.error(
        isEditMode
          ? "Failed to update interview:"
          : "Failed to create interview:",
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
          isEditMode
            ? "Failed to update interview."
            : "Failed to create interview."
        );
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
              Interview management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {isEditMode
                ? "Edit Interview"
                : "Add Interview"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {application.job_title} at{" "}
              {application.company}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close interview form"
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
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* ===================================================
              EDIT MODE INFORMATION
          =================================================== */}

          {isEditMode && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

              <p className="text-sm font-semibold text-blue-700">
                Editing existing interview
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-600">
                Update the interview details, preparation notes,
                meeting information, follow-up, or result.
              </p>

            </div>
          )}

          {/* ===================================================
              INTERVIEW DETAILS
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Interview details
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* INTERVIEW TYPE */}

              <div>

                <label
                  htmlFor="interview-type"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Interview type *
                </label>

                <select
                  id="interview-type"
                  value={interviewType}
                  onChange={(e) =>
                    setInterviewType(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
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

              {/* DATE AND TIME */}

              <div>

                <label
                  htmlFor="interview-scheduled-at"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Date and time *
                </label>

                <input
                  id="interview-scheduled-at"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) =>
                    setScheduledAt(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              {/* TIMEZONE */}

              <div>

                <label
                  htmlFor="interview-timezone"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Timezone
                </label>

                <input
                  id="interview-timezone"
                  type="text"
                  value={timezone}
                  onChange={(e) =>
                    setTimezone(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="Asia/Yangon"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              {/* RESULT */}

              <div>

                <label
                  htmlFor="interview-result"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Result
                </label>

                <select
                  id="interview-result"
                  value={result}
                  onChange={(e) =>
                    setResult(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
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

          {/* ===================================================
              INTERVIEWER
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Interviewer
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* NAME */}

              <div>

                <label
                  htmlFor="interviewer-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Interviewer name
                </label>

                <input
                  id="interviewer-name"
                  type="text"
                  value={interviewerName}
                  onChange={(e) =>
                    setInterviewerName(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="interviewer-email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Interviewer email
                </label>

                <input
                  id="interviewer-email"
                  type="email"
                  value={interviewerEmail}
                  onChange={(e) =>
                    setInterviewerEmail(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="jane@company.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

            </div>

          </section>

          {/* ===================================================
              LOCATION / MEETING
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Location and meeting
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* LOCATION */}

              <div>

                <label
                  htmlFor="interview-location"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Location
                </label>

                <input
                  id="interview-location"
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="Remote / Office / Meeting room"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              {/* MEETING URL */}

              <div>

                <label
                  htmlFor="interview-meeting-url"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Meeting URL
                </label>

                <input
                  id="interview-meeting-url"
                  type="url"
                  value={meetingUrl}
                  onChange={(e) =>
                    setMeetingUrl(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

            </div>

          </section>

          {/* ===================================================
              PREPARATION
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Preparation
            </h3>

            <div className="mt-4 space-y-4">

              {/* PREPARATION NOTES */}

              <div>

                <label
                  htmlFor="preparation-notes"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Preparation notes
                </label>

                <textarea
                  id="preparation-notes"
                  rows={4}
                  value={preparationNotes}
                  onChange={(e) =>
                    setPreparationNotes(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="Topics to review, questions to prepare, company research..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              {/* INTERVIEW NOTES */}

              <div>

                <label
                  htmlFor="interview-notes"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Interview notes
                </label>

                <textarea
                  id="interview-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder={
                    isEditMode
                      ? "Add notes about how the interview went, feedback, questions asked..."
                      : "General notes about this interview..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

            </div>

          </section>

          {/* ===================================================
              FOLLOW-UP
          =================================================== */}

          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Follow-up
            </h3>

            <div className="mt-4">

              <label
                htmlFor="follow-up-date"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Follow-up date
              </label>

              <input
                id="follow-up-date"
                type="datetime-local"
                value={followUpDate}
                onChange={(e) =>
                  setFollowUpDate(
                    e.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 sm:max-w-sm"
              />

              <p className="mt-2 text-xs text-slate-500">
                Use this for recruiter follow-ups or thank-you reminders.
              </p>

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
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading
                ? isEditMode
                  ? "Saving changes..."
                  : "Adding interview..."
                : isEditMode
                ? "Save Changes"
                : "Add Interview"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default InterviewForm;