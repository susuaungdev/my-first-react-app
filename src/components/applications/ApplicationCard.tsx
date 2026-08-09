import type { Application } from "../../services/applicationService";

type ApplicationCardProps = {
  application: Application;
  onView: (application: Application) => void;
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
};

function ApplicationCard({
  application,
  onView,
  onEdit,
  onDelete,
}: ApplicationCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="p-5 transition hover:bg-slate-50/70 sm:p-6">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        {/* MAIN INFORMATION */}
        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <h4 className="text-lg font-bold text-slate-900">
              {application.job_title}
            </h4>

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
                    : application.status === "Screening"
                    ? "bg-violet-50 text-violet-700"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              {application.status}
            </span>

          </div>


          <p className="mt-1 font-semibold text-blue-600">
            {application.company}
          </p>


          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

            <span>
              {application.location || "Location not set"}
            </span>

            <span>
              {application.employment_type || "Employment type not set"}
            </span>

            {application.salary && (
              <span>
                {application.salary}
              </span>
            )}

          </div>


          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">

            <span>
              Applied: {formatDate(application.date_applied)}
            </span>

            {application.deadline && (
              <span>
                Deadline: {formatDate(application.deadline)}
              </span>
            )}

          </div>


          {application.notes && (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
              {application.notes}
            </p>
          )}

        </div>


        {/* ACTION BUTTONS */}
        <div className="flex shrink-0 flex-wrap gap-2">

          <button
            onClick={() => onView(application)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View
          </button>

          <button
            onClick={() => onEdit(application)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(application)}
            className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default ApplicationCard;