import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

import ApplicationForm from "../components/applications/ApplicationForm";
import DeleteApplicationModal from "../components/applications/DeleteApplicationModal";
import EditApplicationForm from "../components/applications/EditApplicationForm";
import ApplicationDetailsModal from "../components/applications/ApplicationDetailsModal";
import ApplicationCard from "../components/applications/ApplicationCard";

import {
  getApplications,
  updateApplication,
  deleteApplication,
  type Application,
  type CreateApplicationData,
} from "../services/applicationService";

/* =========================================================
   APPLICATION STATUS OPTIONS
========================================================= */

const applicationStatuses = [
  "Saved",
  "Applied",
  "Screening",
  "Interview",
  "Technical Interview",
  "Final Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

/* =========================================================
   VIEW TYPE
========================================================= */

type ViewMode =
  | "list"
  | "board";

/* =========================================================
   APPLICATIONS PAGE
========================================================= */

function Applications() {
  const navigate =
    useNavigate();

  /* =========================================================
     USER / SIDEBAR
  ========================================================= */

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const storedUser =
    localStorage.getItem(
      "user"
    );

  const user =
    storedUser
      ? JSON.parse(
          storedUser
        )
      : null;

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  };

  /* =========================================================
     APPLICATION STATE
  ========================================================= */

  const [
    applications,
    setApplications,
  ] =
    useState<
      Application[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("");

  const [
    viewMode,
    setViewMode,
  ] =
    useState<ViewMode>(
      "list"
    );

  const [
    showAddForm,
    setShowAddForm,
  ] =
    useState(false);

  const [
    applicationToDelete,
    setApplicationToDelete,
  ] =
    useState<
      Application | null
    >(null);

  const [
    applicationToEdit,
    setApplicationToEdit,
  ] =
    useState<
      Application | null
    >(null);

  const [
    applicationToView,
    setApplicationToView,
  ] =
    useState<
      Application | null
    >(null);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  /* =========================================================
     KANBAN DRAG STATE
  ========================================================= */

  const [
    activeApplication,
    setActiveApplication,
  ] =
    useState<
      Application | null
    >(null);

  const [
    movingApplicationId,
    setMovingApplicationId,
  ] =
    useState<
      number | null
    >(null);

  /* =========================================================
     DND SENSORS
  ========================================================= */

  const sensors =
    useSensors(
      useSensor(
        PointerSensor,
        {
          activationConstraint: {
            distance: 6,
          },
        }
      ),

      useSensor(
        TouchSensor,
        {
          activationConstraint: {
            delay: 180,
            tolerance: 8,
          },
        }
      )
    );

  /* =========================================================
     LOAD APPLICATIONS
  ========================================================= */

  const loadApplications =
    async () => {
      try {
        setLoading(true);

        setError("");

        const data =
          await getApplications();

        setApplications(
          data.applications ||
            []
        );
      } catch (error) {
        console.error(
          error
        );

        if (
          error instanceof
          Error
        ) {
          setError(
            error.message
          );
        } else {
          setError(
            "Failed to load applications."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  /* =========================================================
     REFRESH WITHOUT FULL-PAGE LOADING STATE
  ========================================================= */

  const refreshApplications =
    async () => {
      const data =
        await getApplications();

      setApplications(
        data.applications ||
          []
      );
    };

  useEffect(() => {
    loadApplications();
  }, []);

  /* =========================================================
     DELETE APPLICATION
  ========================================================= */

  const handleDeleteApplication =
    async () => {
      if (
        !applicationToDelete
      ) {
        return;
      }

      try {
        setDeleting(true);

        setError("");

        await deleteApplication(
          applicationToDelete.id
        );

        setApplicationToDelete(
          null
        );

        await loadApplications();
      } catch (error) {
        console.error(
          error
        );

        if (
          error instanceof
          Error
        ) {
          setError(
            error.message
          );
        } else {
          setError(
            "Failed to delete application."
          );
        }
      } finally {
        setDeleting(false);
      }
    };

  /* =========================================================
     FILTER APPLICATIONS
  ========================================================= */

  const filteredApplications =
    applications.filter(
      (
        application
      ) => {
        const searchText =
          search
            .trim()
            .toLowerCase();

        const matchesSearch =
          application.company
            .toLowerCase()
            .includes(
              searchText
            ) ||
          application.job_title
            .toLowerCase()
            .includes(
              searchText
            );

        const matchesStatus =
          !statusFilter ||
          application.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  const clearFilters = () => {
    setSearch("");

    setStatusFilter("");
  };

  /* =========================================================
     BOARD HELPERS
  ========================================================= */

  const getApplicationsForStatus =
    (
      status: string
    ) => {
      return filteredApplications.filter(
        (
          application
        ) =>
          application.status ===
          status
      );
    };

  const getStatusStyles = (
    status: string
  ) => {
    if (
      status === "Offer"
    ) {
      return {
        header:
          "bg-emerald-50 text-emerald-700",

        count:
          "bg-emerald-100 text-emerald-700",

        border:
          "border-emerald-200",

        drop:
          "border-emerald-400 bg-emerald-50/60",
      };
    }

    if (
      status ===
      "Rejected"
    ) {
      return {
        header:
          "bg-red-50 text-red-700",

        count:
          "bg-red-100 text-red-700",

        border:
          "border-red-200",

        drop:
          "border-red-400 bg-red-50/60",
      };
    }

    if (
      status ===
      "Withdrawn"
    ) {
      return {
        header:
          "bg-slate-100 text-slate-600",

        count:
          "bg-slate-200 text-slate-600",

        border:
          "border-slate-200",

        drop:
          "border-slate-400 bg-slate-100",
      };
    }

    if (
      status.includes(
        "Interview"
      )
    ) {
      return {
        header:
          "bg-amber-50 text-amber-700",

        count:
          "bg-amber-100 text-amber-700",

        border:
          "border-amber-200",

        drop:
          "border-amber-400 bg-amber-50/60",
      };
    }

    if (
      status ===
      "Applied"
    ) {
      return {
        header:
          "bg-blue-50 text-blue-700",

        count:
          "bg-blue-100 text-blue-700",

        border:
          "border-blue-200",

        drop:
          "border-blue-400 bg-blue-50/60",
      };
    }

    if (
      status ===
      "Screening"
    ) {
      return {
        header:
          "bg-violet-50 text-violet-700",

        count:
          "bg-violet-100 text-violet-700",

        border:
          "border-violet-200",

        drop:
          "border-violet-400 bg-violet-50/60",
      };
    }

    return {
      header:
        "bg-slate-50 text-slate-700",

      count:
        "bg-slate-100 text-slate-600",

      border:
        "border-slate-200",

      drop:
        "border-blue-400 bg-blue-50/40",
    };
  };

  /* =========================================================
     BUILD FULL UPDATE PAYLOAD
  ========================================================= */

  const buildApplicationPayload =
    (
      application:
        Application,
      newStatus:
        string
    ):
      CreateApplicationData => {
      return {
        company:
          application.company,

        job_title:
          application.job_title,

        location:
          application.location ||
          "",

        job_url:
          application.job_url ||
          "",

        salary:
          application.salary ||
          "",

        employment_type:
          application.employment_type ||
          "Full-time",

        description:
          application.description ||
          "",

        date_applied:
          application.date_applied
            ? application.date_applied.slice(
                0,
                10
              )
            : "",

        deadline:
          application.deadline
            ? application.deadline.slice(
                0,
                10
              )
            : "",

        status:
          newStatus,

        notes:
          application.notes ||
          "",

        interview_date:
          application.interview_date
            ? application.interview_date.slice(
                0,
                16
              )
            : "",

        contact_person:
          application.contact_person ||
          "",

        resume_id:
          application.resume_id,
      };
    };

  /* =========================================================
     DRAG START
  ========================================================= */

  const handleDragStart = (
    event:
      DragStartEvent
  ) => {
    const application =
      applications.find(
        (
          item
        ) =>
          item.id ===
          Number(
            event.active.id
          )
      );

    setActiveApplication(
      application || null
    );
  };

  /* =========================================================
     DRAG CANCEL
  ========================================================= */

  const handleDragCancel =
    () => {
      setActiveApplication(
        null
      );
    };

  /* =========================================================
     DRAG END
  ========================================================= */

  const handleDragEnd =
    async (
      event:
        DragEndEvent
    ) => {
      const {
        active,
        over,
      } = event;

      setActiveApplication(
        null
      );

      if (
        !over ||
        movingApplicationId !==
          null
      ) {
        return;
      }

      const applicationId =
        Number(
          active.id
        );

      const application =
        applications.find(
          (
            item
          ) =>
            item.id ===
            applicationId
        );

      if (!application) {
        return;
      }

      const targetStatus =
        over.data.current
          ?.status;

      if (
        typeof targetStatus !==
        "string"
      ) {
        return;
      }

      if (
        !applicationStatuses.includes(
          targetStatus as
            (typeof applicationStatuses)[number]
        )
      ) {
        return;
      }

      if (
        application.status ===
        targetStatus
      ) {
        return;
      }

      /* =====================================================
         SAVE PREVIOUS STATE FOR ROLLBACK
      ===================================================== */

      const previousApplications =
        applications;

      /* =====================================================
         OPTIMISTIC UI UPDATE
      ===================================================== */

      setApplications(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              applicationId
                ? {
                    ...item,

                    status:
                      targetStatus,
                  }
                : item
          )
      );

      setMovingApplicationId(
        applicationId
      );

      setError("");

      try {
        const payload =
          buildApplicationPayload(
            application,
            targetStatus
          );

        await updateApplication(
          applicationId,
          payload
        );

        /*
         Keep local optimistic state because
         the backend has now successfully saved it.

         Refresh silently afterward so updated_at,
         resume joins, and all backend data stay synced.
        */

        await refreshApplications();
      } catch (error) {
        console.error(
          "Failed to move application:",
          error
        );

        /* ===================================================
           ROLLBACK
        =================================================== */

        setApplications(
          previousApplications
        );

        if (
          error instanceof
          Error
        ) {
          setError(
            `Could not move application: ${error.message}`
          );
        } else {
          setError(
            "Could not move application. The change was reverted."
          );
        }
      } finally {
        setMovingApplicationId(
          null
        );
      }
    };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

        <button
          type="button"
          onClick={() =>
            setSidebarOpen(
              true
            )
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

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        isOpen={
          sidebarOpen
        }

        onClose={() =>
          setSidebarOpen(
            false
          )
        }

        user={user}

        onLogout={
          handleLogout
        }
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="min-w-0 lg:ml-64">

        {/* =====================================================
            DESKTOP HEADER
        ===================================================== */}

        <DashboardHeader
          user={user}
        />

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* ===================================================
              PAGE HEADING
          =================================================== */}

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">

              <p className="text-sm font-semibold text-blue-600">
                CareerFlow
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Your job applications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track every application,
                interview, offer, and
                rejection in one place.
              </p>

            </div>

            <button
              onClick={() =>
                setShowAddForm(
                  true
                )
              }
              className="w-full shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              + Add Application
            </button>

          </div>

          {/* ===================================================
              SEARCH / FILTERS
          =================================================== */}

          <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-3">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search company or job title..."
              className="min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >

              <option value="">
                All statuses
              </option>

              {applicationStatuses.map(
                (
                  status
                ) => (
                  <option
                    key={
                      status
                    }
                    value={
                      status
                    }
                  >
                    {
                      status
                    }
                  </option>
                )
              )}

            </select>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:col-span-2 xl:col-span-1"
            >
              Clear filters
            </button>

          </div>

          {/* ===================================================
              TOOLBAR
          =================================================== */}

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-bold text-slate-900">
                Application workspace
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {
                  filteredApplications.length
                }{" "}
                of{" "}
                {
                  applications.length
                }{" "}
                application
                {
                  applications.length !==
                  1
                    ? "s"
                    : ""
                }{" "}
                shown
              </p>

              {viewMode ===
                "board" && (
                <p className="mt-1 text-xs text-slate-400">
                  Drag cards between columns to update their status.
                </p>
              )}

            </div>

            {/* VIEW SWITCH */}

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">

              <button
                type="button"
                onClick={() =>
                  setViewMode(
                    "list"
                  )
                }
                className={`
                  rounded-lg px-4 py-2 text-sm font-semibold transition
                  ${
                    viewMode ===
                    "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }
                `}
              >
                List
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode(
                    "board"
                  )
                }
                className={`
                  rounded-lg px-4 py-2 text-sm font-semibold transition
                  ${
                    viewMode ===
                    "board"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }
                `}
              >
                Board
              </button>

            </div>

          </div>

          {/* ===================================================
              MOVING MESSAGE
          =================================================== */}

          {movingApplicationId !==
            null && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">

              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

              <p className="text-sm font-medium text-blue-700">
                Saving application status...
              </p>

            </div>
          )}

          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ===================================================
              LOADING
          =================================================== */}

          {loading && (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading applications...
                </p>

              </div>

            </div>
          )}

          {/* ===================================================
              EMPTY STATE
          =================================================== */}

          {!loading &&
            filteredApplications.length ===
              0 && (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-600">
                  +
                </div>

                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  {
                    applications.length ===
                    0
                      ? "No applications yet"
                      : "No matching applications"
                  }
                </h4>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {
                    applications.length ===
                    0
                      ? "Add your first job application and start tracking your progress."
                      : "Try changing your search or status filter."
                  }
                </p>

                {applications.length ===
                  0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAddForm(
                        true
                      )
                    }
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Add your first application
                  </button>
                )}

              </div>
            )}

          {/* ===================================================
              LIST VIEW
          =================================================== */}

          {!loading &&
            filteredApplications.length >
              0 &&
            viewMode ===
              "list" && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                  <h3 className="font-bold text-slate-900">
                    Applications
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      filteredApplications.length
                    }{" "}
                    application
                    {
                      filteredApplications.length !==
                      1
                        ? "s"
                        : ""
                    }{" "}
                    shown
                  </p>

                </div>

                <div className="divide-y divide-slate-100">

                  {filteredApplications.map(
                    (
                      application
                    ) => (
                      <ApplicationCard
                        key={
                          application.id
                        }

                        application={
                          application
                        }

                        onView={
                          setApplicationToView
                        }

                        onEdit={
                          setApplicationToEdit
                        }

                        onDelete={
                          setApplicationToDelete
                        }
                      />
                    )
                  )}

                </div>

              </div>
            )}

          {/* ===================================================
              BOARD VIEW
          =================================================== */}

          {!loading &&
            filteredApplications.length >
              0 &&
            viewMode ===
              "board" && (
              <DndContext
                sensors={
                  sensors
                }

                collisionDetection={
                  closestCorners
                }

                onDragStart={
                  handleDragStart
                }

                onDragCancel={
                  handleDragCancel
                }

                onDragEnd={
                  handleDragEnd
                }
              >

                <div className="overflow-x-auto pb-4">

                  <div className="flex min-w-max gap-4">

                    {applicationStatuses.map(
                      (
                        status
                      ) => (
                        <KanbanColumn
                          key={
                            status
                          }

                          status={
                            status
                          }

                          applications={
                            getApplicationsForStatus(
                              status
                            )
                          }

                          styles={
                            getStatusStyles(
                              status
                            )
                          }

                          movingApplicationId={
                            movingApplicationId
                          }

                          onView={
                            setApplicationToView
                          }

                          onEdit={
                            setApplicationToEdit
                          }

                          onDelete={
                            setApplicationToDelete
                          }
                        />
                      )
                    )}

                  </div>

                </div>

                {/* =============================================
                    DRAG OVERLAY
                ============================================= */}

                <DragOverlay>

                  {activeApplication ? (
                    <div className="w-[290px] rotate-1 opacity-95">

                      <KanbanCardPreview
                        application={
                          activeApplication
                        }
                      />

                    </div>
                  ) : null}

                </DragOverlay>

              </DndContext>
            )}

        </main>

      </div>

      {/* =====================================================
          ADD APPLICATION MODAL
      ===================================================== */}

      {showAddForm && (
        <ApplicationForm
          onClose={() =>
            setShowAddForm(
              false
            )
          }

          onCreated={
            loadApplications
          }
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {applicationToDelete && (
        <DeleteApplicationModal
          company={
            applicationToDelete.company
          }

          jobTitle={
            applicationToDelete.job_title
          }

          loading={
            deleting
          }

          onCancel={() =>
            setApplicationToDelete(
              null
            )
          }

          onConfirm={
            handleDeleteApplication
          }
        />
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {applicationToEdit && (
        <EditApplicationForm
          application={
            applicationToEdit
          }

          onClose={() =>
            setApplicationToEdit(
              null
            )
          }

          onUpdated={
            loadApplications
          }
        />
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {applicationToView && (
        <ApplicationDetailsModal
          application={
            applicationToView
          }

          onClose={() =>
            setApplicationToView(
              null
            )
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   KANBAN COLUMN
========================================================= */

type KanbanColumnProps = {
  status: string;

  applications:
    Application[];

  styles: {
    header: string;
    count: string;
    border: string;
    drop: string;
  };

  movingApplicationId:
    number | null;

  onView: (
    application:
      Application
  ) => void;

  onEdit: (
    application:
      Application
  ) => void;

  onDelete: (
    application:
      Application
  ) => void;
};

function KanbanColumn({
  status,
  applications,
  styles,
  movingApplicationId,
  onView,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id:
      `status-${status}`,

    data: {
      status,
    },
  });

  return (
    <section
      ref={
        setNodeRef
      }
      className={`
        flex w-[310px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200

        ${
          isOver
            ? styles.drop
            : styles.border
        }

        ${
          isOver
            ? "ring-2 ring-blue-100"
            : ""
        }
      `}
    >

      {/* =====================================================
          COLUMN HEADER
      ===================================================== */}

      <div
        className={`
          flex items-center justify-between border-b px-4 py-4

          ${
            styles.header
          }
        `}
      >

        <div className="min-w-0">

          <h3 className="truncate text-sm font-bold">
            {status}
          </h3>

        </div>

        <span
          className={`
            flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold

            ${
              styles.count
            }
          `}
        >
          {
            applications.length
          }
        </span>

      </div>

      {/* =====================================================
          COLUMN BODY
      ===================================================== */}

      <div
        className={`
          min-h-[320px] flex-1 space-y-3 p-3 transition

          ${
            isOver
              ? "bg-blue-50/30"
              : "bg-slate-50/70"
          }
        `}
      >

        {isOver && (
          <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-center">

            <p className="text-xs font-semibold text-blue-600">
              Drop here to move to {status}
            </p>

          </div>
        )}

        {applications.length ===
        0 ? (
          <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 text-center">

            <p className="text-xs leading-5 text-slate-400">
              No applications in this stage.
            </p>

          </div>
        ) : (
          applications.map(
            (
              application
            ) => (
              <DraggableKanbanApplicationCard
                key={
                  application.id
                }

                application={
                  application
                }

                moving={
                  movingApplicationId ===
                  application.id
                }

                disabled={
                  movingApplicationId !==
                  null
                }

                onView={
                  onView
                }

                onEdit={
                  onEdit
                }

                onDelete={
                  onDelete
                }
              />
            )
          )
        )}

      </div>

    </section>
  );
}

/* =========================================================
   DRAGGABLE KANBAN APPLICATION CARD
========================================================= */

type DraggableKanbanApplicationCardProps = {
  application:
    Application;

  moving: boolean;

  disabled: boolean;

  onView: (
    application:
      Application
  ) => void;

  onEdit: (
    application:
      Application
  ) => void;

  onDelete: (
    application:
      Application
  ) => void;
};

function DraggableKanbanApplicationCard({
  application,
  moving,
  disabled,
  onView,
  onEdit,
  onDelete,
}: DraggableKanbanApplicationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id:
      application.id,

    disabled,

    data: {
      applicationId:
        application.id,

      status:
        application.status,
    },
  });

  const style:
    React.CSSProperties = {
      transform:
        transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,

      opacity:
        isDragging
          ? 0.25
          : 1,
  };

  const formatDate = (
    date:
      string | null
  ) => {
    if (!date) {
      return null;
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  return (
    <article
      ref={
        setNodeRef
      }

      style={
        style
      }

      className={`
        rounded-xl border bg-white p-4 shadow-sm transition

        ${
          moving
            ? "border-blue-300 opacity-70 ring-2 ring-blue-100"
            : "border-slate-200 hover:border-blue-200 hover:shadow-md"
        }
      `}
    >

      {/* =====================================================
          CARD TOP
      ===================================================== */}

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0 flex-1">

          <h4 className="line-clamp-2 text-sm font-bold text-slate-900">
            {
              application.job_title
            }
          </h4>

          <p className="mt-1 truncate text-sm font-semibold text-blue-600">
            {
              application.company
            }
          </p>

        </div>

        {/* ===================================================
            DRAG HANDLE
        =================================================== */}

        <button
          type="button"

          {...listeners}
          {...attributes}

          disabled={
            disabled
          }

          className="flex h-8 w-8 shrink-0 touch-none cursor-grab items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"

          aria-label={`Move ${application.job_title}`}
          title="Drag to change status"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="7"
              r="1.5"
            />

            <circle
              cx="16"
              cy="7"
              r="1.5"
            />

            <circle
              cx="8"
              cy="12"
              r="1.5"
            />

            <circle
              cx="16"
              cy="12"
              r="1.5"
            />

            <circle
              cx="8"
              cy="17"
              r="1.5"
            />

            <circle
              cx="16"
              cy="17"
              r="1.5"
            />
          </svg>
        </button>

      </div>

      {/* =====================================================
          META
      ===================================================== */}

      <div className="mt-3 space-y-1.5 text-xs text-slate-500">

        {application.location && (
          <p className="truncate">
            {
              application.location
            }
          </p>
        )}

        {application.employment_type && (
          <p className="truncate">
            {
              application.employment_type
            }
          </p>
        )}

        {application.date_applied && (
          <p>
            Applied:{" "}
            {
              formatDate(
                application.date_applied
              )
            }
          </p>
        )}

        {application.deadline && (
          <p>
            Deadline:{" "}
            {
              formatDate(
                application.deadline
              )
            }
          </p>
        )}

      </div>

      {/* =====================================================
          LINKED RESUME
      ===================================================== */}

      {application.resume_title && (
        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">

          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">
            Resume
          </p>

          <p className="mt-1 truncate text-xs font-semibold text-blue-700">
            {
              application.resume_title
            }
          </p>

        </div>
      )}

      {/* =====================================================
          NOTES
      ===================================================== */}

      {application.notes && (
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
          {
            application.notes
          }
        </p>
      )}

      {/* =====================================================
          SAVING
      ===================================================== */}

      {moving && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">

          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

          <p className="text-xs font-semibold text-blue-600">
            Saving status...
          </p>

        </div>
      )}

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">

        <button
          type="button"
          onClick={() =>
            onView(
              application
            )
          }
          disabled={
            disabled
          }
          className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          View
        </button>

        <button
          type="button"
          onClick={() =>
            onEdit(
              application
            )
          }
          disabled={
            disabled
          }
          className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(
              application
            )
          }
          disabled={
            disabled
          }
          className="rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>

      </div>

    </article>
  );
}

/* =========================================================
   DRAG OVERLAY CARD
========================================================= */

type KanbanCardPreviewProps = {
  application:
    Application;
};

function KanbanCardPreview({
  application,
}: KanbanCardPreviewProps) {
  return (
    <div className="rounded-xl border border-blue-300 bg-white p-4 shadow-2xl ring-2 ring-blue-100">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <h4 className="line-clamp-2 text-sm font-bold text-slate-900">
            {
              application.job_title
            }
          </h4>

          <p className="mt-1 truncate text-sm font-semibold text-blue-600">
            {
              application.company
            }
          </p>

        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="7"
              r="1.5"
            />

            <circle
              cx="16"
              cy="7"
              r="1.5"
            />

            <circle
              cx="8"
              cy="12"
              r="1.5"
            />

            <circle
              cx="16"
              cy="12"
              r="1.5"
            />

            <circle
              cx="8"
              cy="17"
              r="1.5"
            />

            <circle
              cx="16"
              cy="17"
              r="1.5"
            />
          </svg>
        </div>

      </div>

      <div className="mt-3">

        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {
            application.status
          }
        </span>

      </div>

      {application.resume_title && (
        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">

          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">
            Resume
          </p>

          <p className="mt-1 truncate text-xs font-semibold text-blue-700">
            {
              application.resume_title
            }
          </p>

        </div>
      )}

      <p className="mt-4 text-xs font-medium text-slate-400">
        Move to another pipeline stage
      </p>

    </div>
  );
}

export default Applications;