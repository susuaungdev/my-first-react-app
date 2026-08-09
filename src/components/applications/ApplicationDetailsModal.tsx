import type { Application } from "../../services/applicationService";

type ApplicationDetailsModalProps = {
  application: Application;
  onClose: () => void;
};

function ApplicationDetailsModal({
  application,
  onClose,
}: ApplicationDetailsModalProps) {
  const formatDate = (date: string | null) => {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: string | null) => {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 px-4 py-6">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>
            <p className="text-sm font-semibold text-blue-600">
              Application details
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {application.job_title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {application.company}
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


        {/* Content */}
        <div className="space-y-7 p-6">

          {/* Status */}
          <div className="flex flex-wrap items-center gap-3">

            <span
              className={`
                rounded-full px-3 py-1 text-xs font-semibold

                ${
                  application.status === "Offer"
                    ? "bg-emerald-50 text-emerald-700"
                    : application.status === "Rejected"
                    ? "bg-red-50 text-red-700"
                    : application.status.includes("Interview")
                    ? "bg-amber-50 text-amber-700"
                    : application.status === "Applied"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              {application.status}
            </span>

            <span className="text-sm text-slate-500">
              {application.employment_type || "Employment type not set"}
            </span>

          </div>


          {/* Basic Information */}
          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Basic information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <DetailItem
                label="Company"
                value={application.company}
              />

              <DetailItem
                label="Job title"
                value={application.job_title}
              />

              <DetailItem
                label="Location"
                value={application.location || "Not set"}
              />

              <DetailItem
                label="Salary"
                value={application.salary || "Not set"}
              />

              <DetailItem
                label="Employment type"
                value={application.employment_type || "Not set"}
              />

              <DetailItem
                label="Status"
                value={application.status}
              />

            </div>

          </section>


          {/* Dates */}
          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Dates
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <DetailItem
                label="Date applied"
                value={formatDate(application.date_applied)}
              />

              <DetailItem
                label="Deadline"
                value={formatDate(application.deadline)}
              />

              <DetailItem
                label="Interview date"
                value={formatDateTime(application.interview_date)}
              />

              <DetailItem
                label="Created"
                value={formatDateTime(application.created_at)}
              />

            </div>

          </section>


          {/* Contact */}
          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Contact and link
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <DetailItem
                label="Contact person"
                value={application.contact_person || "Not set"}
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Job URL
                </p>

                {application.job_url ? (
                  <a
                    href={application.job_url}
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


          {/* Description */}
          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Description
            </h3>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {application.description || "No description added."}
              </p>

            </div>

          </section>


          {/* Notes */}
          <section>

            <h3 className="text-sm font-bold text-slate-900">
              Notes
            </h3>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {application.notes || "No notes added."}
              </p>

            </div>

          </section>


          {/* Footer */}
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
  );
}


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

export default ApplicationDetailsModal;