import { useNavigate } from "react-router-dom";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;

  user: {
    name?: string;
    email?: string;
  } | null;

  onLogout: () => void;
};

function Sidebar({
  isOpen,
  onClose,
  user,
  onLogout,
}: SidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <h1 className="text-2xl font-bold tracking-tight text-blue-600">
            CareerFlow
          </h1>

          <button
            onClick={onClose}
            className="text-xl text-slate-500 lg:hidden"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          <button
            onClick={() => {
              navigate("/dashboard");
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-left text-sm font-semibold text-blue-700"
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span>◫</span>
            Resumes
          </button>

          <button
            onClick={() => {
              navigate("/applications");
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span>▣</span>
            Job Applications
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span>☆</span>
            Saved Jobs
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span>↗</span>
            Analytics
          </button>

          <button
            onClick={() => {
              navigate("/profile");
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span>⚙</span>
            Profile
          </button>
        </nav>

        {/* USER SECTION */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "CareerFlow User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;