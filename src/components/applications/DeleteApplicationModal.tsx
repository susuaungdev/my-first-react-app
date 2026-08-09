type DeleteApplicationModalProps = {
  company: string;
  jobTitle: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function DeleteApplicationModal({
  company,
  jobTitle,
  loading,
  onConfirm,
  onCancel,
}: DeleteApplicationModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
          !
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Delete application?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete the application for{" "}
          <span className="font-semibold text-slate-700">
            {jobTitle}
          </span>{" "}
          at{" "}
          <span className="font-semibold text-slate-700">
            {company}
          </span>
          ?
        </p>

        <p className="mt-3 text-sm text-red-600">
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Deleting..."
              : "Delete application"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default DeleteApplicationModal;