import { useState } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../components/dashboard/StatCard";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* MOBILE HEADER */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          aria-label="Open menu"
        >
          <span className="text-xl">
            ☰
          </span>
        </button>

        <h1 className="text-xl font-bold text-blue-600">
          CareerFlow
        </h1>

        <div className="h-10 w-10" />

      </header>


      {/* SIDEBAR COMPONENT */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />


      {/* MAIN CONTENT */}
      <div className="lg:ml-64">

       <DashboardHeader user={user} />

        {/* PAGE CONTENT */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <div className="mx-auto max-w-7xl">

            {/* WELCOME SECTION */}
            <section className="mb-8">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

                <p className="text-sm font-semibold text-blue-600">
                  Dashboard
                </p>


                <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Welcome back,{" "}
                      {user?.name?.split(" ")[0] || "there"}.
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Keep track of your job search, manage your resumes,
                      and monitor your career progress from one place.
                    </p>

                  </div>


                  <button
                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                  >
                    + Add Application
                  </button>

                </div>

              </div>

            </section>


            {/* STATISTICS */}
            <section className="mb-8">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                  title="Total Applications"
                  value={0}
                  description="Applications submitted"
                  icon="01"
                  iconClassName="bg-blue-50 text-blue-600"
                />

                <StatCard
                  title="Interviews"
                  value={0}
                  description="Interview opportunities"
                  icon="02"
                  iconClassName="bg-amber-50 text-amber-600"
                />

                <StatCard
                  title="Offers"
                  value={0}
                  description="Job offers received"
                  icon="03"
                  iconClassName="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                  title="Resumes"
                  value={0}
                  description="Resume versions created"
                  icon="04"
                  iconClassName="bg-purple-50 text-purple-600"
                />

              </div>

            </section>


            {/* MAIN DASHBOARD GRID */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

              {/* RECENT APPLICATIONS */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Recent Applications
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Your latest job applications.
                    </p>

                  </div>


                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    View all
                  </button>

                </div>


                {/* EMPTY STATE */}
                <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    +
                  </div>

                  <h4 className="mt-4 font-semibold text-slate-900">
                    No applications yet
                  </h4>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Add your first job application and start tracking
                    your progress through the hiring process.
                  </p>

                  <button className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Add application
                  </button>

                </div>

              </div>


              {/* QUICK ACTIONS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="font-bold text-slate-900">
                  Quick Actions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Common CareerFlow tasks.
                </p>


                <div className="mt-5 space-y-3">

                  <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50">

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Create Resume
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Build a new resume
                      </p>

                    </div>

                    <span className="text-slate-400">
                      →
                    </span>

                  </button>


                  <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50">

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Add Application
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Track a job application
                      </p>

                    </div>

                    <span className="text-slate-400">
                      →
                    </span>

                  </button>


                  <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50">

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Update Profile
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Manage career information
                      </p>

                    </div>

                    <span className="text-slate-400">
                      →
                    </span>

                  </button>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;