import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar";

import {
  getResumes,
  deleteResume,
  type Resume,
} from "../services/resumeService";

function Resumes() {
  const navigate = useNavigate();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const storedUser =
    localStorage.getItem("user");

  const user =
    storedUser
      ? JSON.parse(storedUser)
      : null;

  const [
    resumes,
    setResumes,
  ] = useState<Resume[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<number | null>(
      null
    );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getResumes();

      setResumes(
        data.resumes
      );

    } catch (error) {

      console.error(error);

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );
      } else {
        setError(
          "Failed to load resumes."
        );
      }

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDelete = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this resume?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteResume(id);

      await loadResumes();

    } catch (error) {

      console.error(error);

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );
      } else {
        setError(
          "Failed to delete resume."
        );
      }

    } finally {

      setDeletingId(null);

    }
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* MOBILE HEADER */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

        <button
          type="button"
          onClick={() =>
            setSidebarOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          aria-label="Open menu"
        >
          <span className="text-xl">
            ☰
          </span>
        </button>

        <h1 className="text-lg font-bold text-blue-600">
          CareerFlow
        </h1>

        <div className="h-10 w-10" />

      </header>

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        user={user}
        onLogout={handleLogout}
      />

      {/* MAIN */}
      <div className="min-w-0 lg:ml-64">

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* PAGE HEADING */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-blue-600">
                CareerFlow
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Your resumes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create and manage professional resume versions
                for different roles and opportunities.
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  "/resumes/new"
                )
              }
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              + Create Resume
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (

            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading resumes...
                </p>

              </div>

            </div>

          ) : resumes.length === 0 ? (

            /* EMPTY STATE */
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2h8l4 4v16H6z" />
                  <path d="M14 2v5h5" />
                  <path d="M9 12h6" />
                  <path d="M9 16h6" />
                </svg>

              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No resumes yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first resume and start building
                a professional version tailored to your next opportunity.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/resumes/new"
                  )
                }
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Create your first resume
              </button>

            </div>

          ) : (

            /* RESUME GRID */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {resumes.map(
                (resume) => (

                  <article
                    key={resume.id}
                    className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >

                    {/* ICON */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 2h8l4 4v16H6z" />
                        <path d="M14 2v5h5" />
                        <path d="M9 12h6" />
                        <path d="M9 16h6" />
                      </svg>

                    </div>

                    {/* TITLE */}
                    <div className="mt-5">

                      <h2 className="break-words text-lg font-bold text-slate-900">
                        {resume.title}
                      </h2>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {resume.summary ||
                          "No professional summary added yet."}
                      </p>

                    </div>

                    {/* META */}
                    <div className="mt-5 space-y-2 text-xs text-slate-400">

                      {resume.location && (
                        <p>
                          {resume.location}
                        </p>
                      )}

                      <p>
                        Updated{" "}
                        {formatDate(
                          resume.updated_at
                        )}
                      </p>

                    </div>

                    {/* ACTIONS */}
                    <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4">

                      <button
                        onClick={() =>
                          navigate(
                            `/resumes/${resume.id}`
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/resumes/${resume.id}/edit`
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            resume.id
                          )
                        }
                        disabled={
                          deletingId ===
                          resume.id
                        }
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId ===
                        resume.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default Resumes;