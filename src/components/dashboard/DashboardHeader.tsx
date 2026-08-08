type DashboardHeaderProps = {
  user: {
    name?: string;
    email?: string;
  } | null;
};

function DashboardHeader({
  user,
}: DashboardHeaderProps) {
  return (
    <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">

      <div>
        <p className="text-sm font-medium text-slate-500">
          Career workspace
        </p>
      </div>

      <div className="flex items-center gap-3">

        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">
            {user?.name || "CareerFlow User"}
          </p>

          <p className="text-xs text-slate-500">
            {user?.email || "user@example.com"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : "U"}
        </div>

      </div>

    </header>
  );
}

export default DashboardHeader;