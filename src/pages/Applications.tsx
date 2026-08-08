import { useNavigate } from "react-router-dom";

function Applications() {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <button
            onClick={handleBackToDashboard}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            ← Dashboard
          </button>

          <h1 className="text-xl font-bold text-slate-900">
            Job Applications
          </h1>

          <div className="w-20" />

        </div>
      </header>


      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              CareerFlow
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Your job applications
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track every application, interview, offer, and rejection in one place.
            </p>

          </div>


          <button
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            + Add Application
          </button>

        </div>


        {/* Search / Filter Section */}
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">

          <input
            type="text"
            placeholder="Search company or job title..."
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All statuses
            </option>

            <option value="Saved">
              Saved
            </option>

            <option value="Applied">
              Applied
            </option>

            <option value="Screening">
              Screening
            </option>

            <option value="Interview">
              Interview
            </option>

            <option value="Technical Interview">
              Technical Interview
            </option>

            <option value="Final Interview">
              Final Interview
            </option>

            <option value="Offer">
              Offer
            </option>

            <option value="Rejected">
              Rejected
            </option>

            <option value="Withdrawn">
              Withdrawn
            </option>
          </select>

          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:col-span-2 lg:col-span-1"
          >
            Clear filters
          </button>

        </div>


        {/* Applications Container */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h3 className="font-bold text-slate-900">
              Applications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your applications will appear here.
            </p>

          </div>


          {/* Temporary Empty State */}
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-600">
              +
            </div>

            <h4 className="mt-4 text-lg font-semibold text-slate-900">
              No applications loaded yet
            </h4>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              In the next step, we’ll connect this page to your real
              GET /api/applications backend endpoint.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Applications;