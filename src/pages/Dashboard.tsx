import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../components/dashboard/StatCard";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

import {
  getDashboardSummary,
  type RecentApplication,
} from "../services/dashboardService";

function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const [totalApplications, setTotalApplications] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [offers, setOffers] = useState(0);
  const [resumes, setResumes] = useState(0);

  const [recentApplications, setRecentApplications] =
    useState<RecentApplication[]>([]);

  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [dashboardError, setDashboardError] = useState("");


  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoadingDashboard(true);
        setDashboardError("");

        const data = await getDashboardSummary();

        setTotalApplications(
          data.summary.totalApplications
        );

        setInterviews(
          data.summary.interviews
        );

        setOffers(
          data.summary.offers
        );

        setResumes(
          data.summary.resumes
        );

        setRecentApplications(
          data.recentApplications
        );

      } catch (error) {

        console.error(
          "Failed to load dashboard summary:",
          error
        );

        if (error instanceof Error) {
          setDashboardError(error.message);
        } else {
          setDashboardError(
            "Failed to load dashboard."
          );
        }

      } finally {

        setLoadingDashboard(false);

      }
    };

    loadDashboard();

  }, []);


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


      {/* SIDEBAR */}
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

            {/* ERROR */}
            {dashboardError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {dashboardError}
              </div>
            )}


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
                    onClick={() => navigate("/applications")}
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
                  value={totalApplications}
                  description="Applications submitted"
                  icon="01"
                  iconClassName="bg-blue-50 text-blue-600"
                />

                <StatCard
                  title="Interviews"
                  value={interviews}
                  description="Interview opportunities"
                  icon="02"
                  iconClassName="bg-amber-50 text-amber-600"
                />

                <StatCard
                  title="Offers"
                  value={offers}
                  description="Job offers received"
                  icon="03"
                  iconClassName="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                  title="Resumes"
                  value={resumes}
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


                  <button
                    onClick={() => navigate("/applications")}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </button>

                </div>


                {loadingDashboard ? (

                  <div className="flex min-h-64 items-center justify-center">

                    <div className="text-center">

                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                      <p className="mt-3 text-sm text-slate-500">
                        Loading dashboard...
                      </p>

                    </div>

                  </div>

                ) : recentApplications.length === 0 ? (

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

                    <button
                      onClick={() => navigate("/applications")}
                      className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Add application
                    </button>

                  </div>

                ) : (

                  <div className="divide-y divide-slate-100">

                    {recentApplications.map(
                      (application) => (

                        <button
                          key={application.id}
                          onClick={() =>
                            navigate("/applications")
                          }
                          className="flex w-full flex-col gap-3 px-6 py-5 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                        >

                          <div>

                            <p className="font-semibold text-slate-900">
                              {application.job_title}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {application.company}
                            </p>

                            {application.location && (
                              <p className="mt-1 text-xs text-slate-400">
                                {application.location}
                              </p>
                            )}

                          </div>


                          <span
                            className={`
                              w-fit rounded-full px-3 py-1 text-xs font-semibold

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

                        </button>

                      )
                    )}

                  </div>

                )}

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

                  <button
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
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


                  <button
                    onClick={() => navigate("/applications")}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
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


                  <button
                    onClick={() => navigate("/profile")}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
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