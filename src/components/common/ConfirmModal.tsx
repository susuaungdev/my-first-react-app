type ConfirmModalProps = {
  isOpen: boolean;

  title?: string;

  message?: string;

  confirmText?: string;

  cancelText?: string;

  loading?: boolean;

  danger?: boolean;

  onConfirm: () => void;

  onCancel: () => void;
};

function ConfirmModal({
  isOpen,

  title = "Are you sure?",

  message = "This action cannot be undone.",

  confirmText = "Confirm",

  cancelText = "Cancel",

  loading = false,

  danger = true,

  onConfirm,

  onCancel,
}: ConfirmModalProps) {
  /* =========================================================
     DON'T RENDER WHEN CLOSED
  ========================================================= */

  if (!isOpen) {
    return null;
  }

  /* =========================================================
     MODAL
  ========================================================= */

  return (
    <div
      className="
        fixed inset-0 z-[200]
        flex items-center justify-center
        px-4
      "
    >
      {/* BACKDROP */}

      <button
        type="button"
        onClick={() => {
          if (!loading) {
            onCancel();
          }
        }}
        className="
          absolute inset-0
          bg-slate-900/40
          backdrop-blur-[2px]
        "
        aria-label="Close confirmation dialog"
      />

      {/* MODAL CARD */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="
          relative z-10
          w-full max-w-md
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-2xl
        "
      >
        {/* CONTENT */}

        <div className="p-6">
          {/* ICON */}

          <div
            className={`
              flex h-12 w-12
              items-center justify-center
              rounded-full

              ${
                danger
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-600"
              }
            `}
          >
            {danger ? (
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v4" />

                <path d="M12 17h.01" />

                <path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path d="M12 8v4" />

                <path d="M12 16h.01" />
              </svg>
            )}
          </div>

          {/* TITLE */}

          <h2
            id="confirm-modal-title"
            className="
              mt-5
              text-xl font-bold
              text-slate-900
            "
          >
            {title}
          </h2>

          {/* MESSAGE */}

          <p
            className="
              mt-2
              text-sm leading-6
              text-slate-500
            "
          >
            {message}
          </p>
        </div>

        {/* ACTIONS */}

        <div
          className="
            flex items-center
            justify-end gap-3
            border-t border-slate-100
            bg-slate-50/70
            px-6 py-4
          "
        >
          {/* CANCEL */}

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              rounded-xl
              border border-slate-200
              bg-white
              px-4 py-2.5
              text-sm font-semibold
              text-slate-700
              transition

              hover:bg-slate-50

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {cancelText}
          </button>

          {/* CONFIRM */}

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`
              flex min-w-[100px]
              items-center justify-center
              gap-2
              rounded-xl
              px-4 py-2.5
              text-sm font-semibold
              text-white
              transition

              disabled:cursor-not-allowed
              disabled:opacity-60

              ${
                danger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {loading && (
              <span
                className="
                  h-4 w-4
                  animate-spin
                  rounded-full
                  border-2 border-white/40
                  border-t-white
                "
              />
            )}

            {loading
              ? "Please wait..."
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;