import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ApplicationForm from "../components/applications/ApplicationForm";
import DeleteApplicationModal from "../components/applications/DeleteApplicationModal";
import EditApplicationForm from "../components/applications/EditApplicationForm";
import ApplicationDetailsModal from "../components/applications/ApplicationDetailsModal";
import ApplicationCard from "../components/applications/ApplicationCard";

import {
  getApplications,
  deleteApplication,
  type Application,
} from "../services/applicationService";


function Applications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [applicationToDelete, setApplicationToDelete] =
    useState<Application | null>(null);

  const [applicationToEdit, setApplicationToEdit] =
  useState<Application | null>(null);

  const [applicationToView, setApplicationToView] =
  useState<Application | null>(null);

  const [deleting, setDeleting] = useState(false);


  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };


  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getApplications();

      setApplications(data.applications);

    } catch (error) {

      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load applications.");
      }

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadApplications();
  }, []);


  const handleDeleteApplication = async () => {
    if (!applicationToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteApplication(
        applicationToDelete.id
      );

      setApplicationToDelete(null);

      await loadApplications();

    } catch (error) {

      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to delete application."
        );
      }

    } finally {

      setDeleting(false);

    }
  };


  const filteredApplications = applications.filter(
    (application) => {

      const searchText = search.toLowerCase();

      const matchesSearch =
        application.company
          .toLowerCase()
          .includes(searchText) ||
        application.job_title
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        !statusFilter ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );


  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };


  const formatDate = (date: string | null) => {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleDateString();
  };


  return (
    <div className="min-h-screen bg-slate-50">

      {/* TOP HEADER */}
      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <button
            onClick={handleBackToDashboard}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            ← Dashboard
          </button>

          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
            Job Applications
          </h1>

          <div className="w-20" />

        </div>

      </header>


      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* PAGE HEADING */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              CareerFlow
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your job applications
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track every application, interview, offer,
              and rejection in one place.
            </p>

          </div>


          <button
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            + Add Application
          </button>

        </div>


        {/* SEARCH / FILTER */}
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search company or job title..."
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >

            <option value="">All statuses</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Interview">Interview</option>
            <option value="Technical Interview">
              Technical Interview
            </option>
            <option value="Final Interview">
              Final Interview
            </option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>

          </select>


          <button
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:col-span-2 lg:col-span-1"
          >
            Clear filters
          </button>

        </div>


        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* APPLICATIONS CONTAINER */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">

            <div>

              <h3 className="font-bold text-slate-900">
                Applications
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {applications.length} application
                {applications.length !== 1 ? "s" : ""} tracked
              </p>

            </div>

          </div>


          {/* LOADING */}
          {loading && (
            <div className="flex min-h-64 items-center justify-center">

              <div className="text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading applications...
                </p>

              </div>

            </div>
          )}


          {/* EMPTY STATE */}
          {!loading &&
            filteredApplications.length === 0 && (

              <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-600">
                  +
                </div>

                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  {applications.length === 0
                    ? "No applications yet"
                    : "No matching applications"}
                </h4>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {applications.length === 0
                    ? "Add your first job application and start tracking your progress."
                    : "Try changing your search or status filter."}
                </p>

              </div>

          )}


          {/* APPLICATION LIST */}
          {!loading &&
            filteredApplications.length > 0 && (

              <div className="divide-y divide-slate-100">

            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onView={setApplicationToView}
                onEdit={setApplicationToEdit}
                onDelete={setApplicationToDelete}
              />
            ))}  

              </div>

          )}

        </div>

      </main>


      {/* ADD APPLICATION MODAL */}
      {showAddForm && (
        <ApplicationForm
          onClose={() =>
            setShowAddForm(false)
          }
          onCreated={
            loadApplications
          }
        />
      )}


      {/* DELETE CONFIRMATION MODAL */}
      {applicationToDelete && (
        <DeleteApplicationModal
          company={applicationToDelete.company}
          jobTitle={applicationToDelete.job_title}
          loading={deleting}
          onCancel={() =>
            setApplicationToDelete(null)
          }
          onConfirm={
            handleDeleteApplication
          }
        />
      )}

      {applicationToEdit && (
        <EditApplicationForm
          application={applicationToEdit}
          onClose={() =>
            setApplicationToEdit(null)
          }
          onUpdated={
            loadApplications
          }
        />
      )}

      {applicationToView && (
        <ApplicationDetailsModal
          application={applicationToView}
          onClose={() =>
            setApplicationToView(null)
          }
        />
      )}

    </div>
  );
}

export default Applications;