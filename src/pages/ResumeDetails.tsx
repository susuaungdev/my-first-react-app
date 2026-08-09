import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar";

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

import {
  getResumeById,
  type Resume,
  type ResumeExperience,
  type ResumeEducation,
  type ResumeProject,
  type ResumeTemplate,
  type ResumeAccentColor,
} from "../services/resumeService";

/* =========================================================
   COLOR HELPERS
========================================================= */

const accentText: Record<
  ResumeAccentColor,
  string
> = {
  blue: "text-blue-700",
  emerald: "text-emerald-700",
  purple: "text-purple-700",
  rose: "text-rose-700",
  slate: "text-slate-700",
  orange: "text-orange-700",
};

const accentBackground: Record<
  ResumeAccentColor,
  string
> = {
  blue: "bg-blue-700",
  emerald: "bg-emerald-700",
  purple: "bg-purple-700",
  rose: "bg-rose-700",
  slate: "bg-slate-800",
  orange: "bg-orange-700",
};

const accentLightBackground: Record<
  ResumeAccentColor,
  string
> = {
  blue: "bg-blue-50",
  emerald: "bg-emerald-50",
  purple: "bg-purple-50",
  rose: "bg-rose-50",
  slate: "bg-slate-100",
  orange: "bg-orange-50",
};

const accentBorder: Record<
  ResumeAccentColor,
  string
> = {
  blue: "border-blue-700",
  emerald: "border-emerald-700",
  purple: "border-purple-700",
  rose: "border-rose-700",
  slate: "border-slate-700",
  orange: "border-orange-700",
};

/* =========================================================
   RESUME DETAILS PAGE
========================================================= */

function ResumeDetails() {
  const navigate = useNavigate();

  const { id } = useParams();

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
    resume,
    setResume,
  ] =
    useState<Resume | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    downloadingPdf,
    setDownloadingPdf,
  ] = useState(false);

  const [
    pdfError,
    setPdfError,
  ] = useState("");

  const resumeRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* =========================================================
     LOGOUT
  ========================================================= */

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
     JSON HELPER
  ========================================================= */

  const parseArray = <T,>(
    value:
      | T[]
      | string
      | null
  ): T[] => {
    if (!value) {
      return [];
    }

    if (
      Array.isArray(value)
    ) {
      return value;
    }

    try {
      const parsed =
        JSON.parse(value);

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    } catch {
      return [];
    }
  };

  /* =========================================================
     LOAD RESUME
  ========================================================= */

  useEffect(() => {
    const loadResume =
      async () => {
        if (!id) {
          setError(
            "Invalid resume ID."
          );

          setLoading(false);

          return;
        }

        const resumeId =
          Number(id);

        if (
          Number.isNaN(
            resumeId
          ) ||
          resumeId <= 0
        ) {
          setError(
            "Invalid resume ID."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);

          setError("");

          const data =
            await getResumeById(
              resumeId
            );

          setResume(
            data.resume
          );
        } catch (error) {
          console.error(
            error
          );

          if (
            error instanceof Error
          ) {
            setError(
              error.message
            );
          } else {
            setError(
              "Failed to load resume."
            );
          }
        } finally {
          setLoading(false);
        }
      };

    loadResume();
  }, [id]);

  /* =========================================================
     DOWNLOAD PDF
  ========================================================= */

  const handleDownloadPdf = async () => {
    if (
      !resume ||
      !resumeRef.current ||
      downloadingPdf
    ) {
      return;
    }

    try {
      setDownloadingPdf(true);
      setPdfError("");

      const resumeElement =
        resumeRef.current;

      const previousWidth =
        resumeElement.style.width;

      const previousMaxWidth =
        resumeElement.style.maxWidth;

      resumeElement.style.width =
        "820px";
      resumeElement.style.maxWidth =
        "820px";

      let canvas: HTMLCanvasElement;

      try {
        canvas = await html2canvas(
          resumeElement,
          {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
            windowWidth: 1200,
          }
        );
      } finally {
        resumeElement.style.width =
          previousWidth;
        resumeElement.style.maxWidth =
          previousMaxWidth;
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;

      const pageHeightPx =
        Math.floor(
          (canvas.width * pageHeight) /
            pageWidth
        );

      let renderedHeight = 0;
      let pageIndex = 0;

      while (
        renderedHeight < canvas.height
      ) {
        const sliceHeight = Math.min(
          pageHeightPx,
          canvas.height - renderedHeight
        );

        const pageCanvas =
          document.createElement(
            "canvas"
          );

        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const context =
          pageCanvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Could not prepare the PDF canvas."
          );
        }

        context.fillStyle = "#ffffff";
        context.fillRect(
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        context.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        if (pageIndex > 0) {
          pdf.addPage();
        }

        const imageData =
          pageCanvas.toDataURL(
            "image/png",
            1.0
          );

        const imageHeightMm =
          (sliceHeight * pageWidth) /
          canvas.width;

        pdf.addImage(
          imageData,
          "PNG",
          0,
          0,
          pageWidth,
          imageHeightMm,
          undefined,
          "FAST"
        );

        renderedHeight += sliceHeight;
        pageIndex += 1;
      }

      const safeTitle =
        resume.title
          .trim()
          .replace(
            /[^a-z0-9]+/gi,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          ) || "resume";

      pdf.save(`${safeTitle}.pdf`);
    } catch (error) {
      console.error(error);

      setPdfError(
        error instanceof Error
          ? error.message
          : "Failed to download PDF."
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <MobileHeader
          onOpen={() =>
            setSidebarOpen(true)
          }
        />

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

        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center lg:ml-64 lg:min-h-screen">

          <div className="text-center">

            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading resume...
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error ||
    !resume
  ) {
    return (
      <div className="min-h-screen bg-slate-50">

        <MobileHeader
          onOpen={() =>
            setSidebarOpen(true)
          }
        />

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

        <div className="lg:ml-64">

          <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

              <p className="text-sm font-medium text-red-700">
                {error ||
                  "Resume not found."}
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/resumes"
                  )
                }
                className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Back to resumes
              </button>

            </div>

          </main>

        </div>

      </div>
    );
  }

  /* =========================================================
     PARSED DATA
  ========================================================= */

  const experience =
    parseArray<ResumeExperience>(
      resume.experience
    );

  const education =
    parseArray<ResumeEducation>(
      resume.education
    );

  const projects =
    parseArray<ResumeProject>(
      resume.projects
    );

  const skills =
    resume.skills
      ? resume.skills
          .split(",")
          .map((skill) =>
            skill.trim()
          )
          .filter(Boolean)
      : [];

  const template: ResumeTemplate =
    resume.template ||
    "classic";

  const accentColor:
    ResumeAccentColor =
    resume.accent_color ||
    "blue";

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* MOBILE HEADER */}

      <MobileHeader
        onOpen={() =>
          setSidebarOpen(true)
        }
      />

      {/* SIDEBAR */}

      <Sidebar
        isOpen={
          sidebarOpen
        }
        onClose={() =>
          setSidebarOpen(false)
        }
        user={user}
        onLogout={
          handleLogout
        }
      />

      {/* MAIN */}

      <div className="min-w-0 lg:ml-64">

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* PAGE HEADER */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">

              <p className="text-sm font-semibold text-blue-600">
                Resume
              </p>

              <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {resume.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {capitalize(
                  template
                )}{" "}
                template ·{" "}
                {capitalize(
                  accentColor
                )}{" "}
                theme
              </p>

            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <button
                onClick={() =>
                  navigate(
                    "/resumes"
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadingPdf
                  ? "Preparing PDF..."
                  : "Download PDF"}
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/resumes/${resume.id}/edit`
                  )
                }
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Edit resume
              </button>

            </div>

          </div>

          {pdfError && (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <span>{pdfError}</span>
              <button
                type="button"
                onClick={() => setPdfError("")}
                className="shrink-0 font-semibold text-red-700 hover:text-red-900"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* RESUME AREA */}

          <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200/70 p-3 shadow-sm sm:p-5 lg:p-6">

            <div
              ref={resumeRef}
              className="mx-auto w-full max-w-[820px]"
            >
              <ResumeRenderer
              template={
                template
              }
              accentColor={
                accentColor
              }

              name={
                user?.name ||
                "Your Name"
              }

              email={
                user?.email ||
                ""
              }

              title={
                resume.title
              }

              summary={
                resume.summary ||
                ""
              }

              phone={
                resume.phone ||
                ""
              }

              location={
                resume.location ||
                ""
              }

              linkedinUrl={
                resume.linkedin_url ||
                ""
              }

              githubUrl={
                resume.github_url ||
                ""
              }

              portfolioUrl={
                resume.portfolio_url ||
                ""
              }

              skills={
                skills
              }

              experience={
                experience
              }

              education={
                education
              }

              projects={
                projects
              }
              />
            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

/* =========================================================
   MOBILE HEADER
========================================================= */

function MobileHeader({
  onOpen,
}: {
  onOpen: () => void;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

      <button
        type="button"
        onClick={onOpen}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
        aria-label="Open menu"
      >
        ☰
      </button>

      <h1 className="text-lg font-bold text-blue-600">
        CareerFlow
      </h1>

      <div className="h-10 w-10" />

    </header>
  );
}

/* =========================================================
   TEMPLATE PROPS
========================================================= */

type ResumeRendererProps = {
  template:
    ResumeTemplate;

  accentColor:
    ResumeAccentColor;

  name: string;

  email: string;

  title: string;

  summary: string;

  phone: string;

  location: string;

  linkedinUrl: string;

  githubUrl: string;

  portfolioUrl: string;

  skills: string[];

  experience:
    ResumeExperience[];

  education:
    ResumeEducation[];

  projects:
    ResumeProject[];
};

type TemplateProps =
  Omit<
    ResumeRendererProps,
    "template"
  >;

/* =========================================================
   RENDERER
========================================================= */

function ResumeRenderer({
  template,
  ...props
}: ResumeRendererProps) {
  switch (template) {
    case "modern":
      return (
        <ModernTemplate
          {...props}
        />
      );

    case "professional":
      return (
        <ProfessionalTemplate
          {...props}
        />
      );

    case "minimal":
      return (
        <MinimalTemplate
          {...props}
        />
      );

    case "executive":
      return (
        <ExecutiveTemplate
          {...props}
        />
      );

    case "creative":
      return (
        <CreativeTemplate
          {...props}
        />
      );

    case "classic":
    default:
      return (
        <ClassicTemplate
          {...props}
        />
      );
  }
}

/* =========================================================
   CLASSIC
========================================================= */

function ClassicTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>

      <header
        className={`border-b-2 pb-6 ${accentBorder[props.accentColor]}`}
      >

        <h1 className="break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {props.name}
        </h1>

        <p
          className={`mt-2 text-base font-semibold ${accentText[props.accentColor]}`}
        >
          {props.title}
        </p>

        <ContactArea
          {...props}
        />

      </header>

      <StandardContent
        {...props}
      />

    </ResumePaper>
  );
}

/* =========================================================
   MODERN
========================================================= */

function ModernTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>

      <div
        className={`${accentBackground[props.accentColor]} -mx-7 -mt-8 px-7 py-8 text-white sm:-mx-10 sm:-mt-10 sm:px-10 lg:-mx-12 lg:-mt-12 lg:px-12 lg:py-10`}
      >

        <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">
          {props.name}
        </h1>

        <p className="mt-2 text-sm font-medium text-white/90">
          {props.title}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">

          {props.phone && (
            <span>
              {props.phone}
            </span>
          )}

          {props.location && (
            <span>
              {props.location}
            </span>
          )}

          {props.email && (
            <span>
              {props.email}
            </span>
          )}

        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/90">

          {props.linkedinUrl && (
            <a
              href={
                props.linkedinUrl
              }
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              LinkedIn
            </a>
          )}

          {props.githubUrl && (
            <a
              href={
                props.githubUrl
              }
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              GitHub
            </a>
          )}

          {props.portfolioUrl && (
            <a
              href={
                props.portfolioUrl
              }
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Portfolio
            </a>
          )}

        </div>

      </div>

      <div className="pt-4">

        <StandardContent
          {...props}
          coloredHeadings
        />

      </div>

    </ResumePaper>
  );
}

/* =========================================================
   PROFESSIONAL
========================================================= */

function ProfessionalTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>

      <header className="grid grid-cols-1 gap-5 border-b border-slate-300 pb-6 sm:grid-cols-[1fr_auto]">

        <div>

          <p
            className={`text-[11px] font-bold uppercase tracking-[0.2em] ${accentText[props.accentColor]}`}
          >
            Curriculum Vitae
          </p>

          <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {props.name}
          </h1>

          <p className="mt-2 text-sm font-semibold text-slate-600">
            {props.title}
          </p>

        </div>

        <div className="text-left text-xs leading-5 text-slate-500 sm:text-right">

          {props.phone && (
            <p>
              {props.phone}
            </p>
          )}

          {props.location && (
            <p>
              {props.location}
            </p>
          )}

          {props.email && (
            <p className="break-all">
              {props.email}
            </p>
          )}

        </div>

      </header>

      <ProfessionalLinks
        {...props}
      />

      <StandardContent
        {...props}
        coloredHeadings
      />

    </ResumePaper>
  );
}

/* =========================================================
   MINIMAL
========================================================= */

function MinimalTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>

      <header className="pb-8 text-center">

        <h1 className="break-words text-3xl font-medium tracking-[0.05em] text-slate-950 sm:text-4xl">
          {props.name}
        </h1>

        <p
          className={`mt-3 text-xs font-semibold uppercase tracking-[0.2em] ${accentText[props.accentColor]}`}
        >
          {props.title}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-400">

          {props.email && (
            <span>
              {props.email}
            </span>
          )}

          {props.phone && (
            <span>
              {props.phone}
            </span>
          )}

          {props.location && (
            <span>
              {props.location}
            </span>
          )}

        </div>

      </header>

      <ProfessionalLinks
        {...props}
        centered
      />

      <StandardContent
        {...props}
        minimal
      />

    </ResumePaper>
  );
}

/* =========================================================
   EXECUTIVE
========================================================= */

function ExecutiveTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>

      <header className="border-y border-slate-900 py-7 text-center">

        <h1 className="break-words font-serif text-4xl font-semibold tracking-wide text-slate-950">
          {props.name}
        </h1>

        <p
          className={`mt-3 text-xs font-bold uppercase tracking-[0.25em] ${accentText[props.accentColor]}`}
        >
          {props.title}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">

          {props.email && (
            <span>
              {props.email}
            </span>
          )}

          {props.phone && (
            <span>
              {props.phone}
            </span>
          )}

          {props.location && (
            <span>
              {props.location}
            </span>
          )}

        </div>

      </header>

      <ProfessionalLinks
        {...props}
        centered
      />

      <StandardContent
        {...props}
        executive
      />

    </ResumePaper>
  );
}

/* =========================================================
   CREATIVE
========================================================= */

function CreativeTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">

        {/* LEFT COLUMN */}

        <aside
          className={`${accentBackground[props.accentColor]} rounded-sm px-5 py-6 text-white`}
        >

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl font-bold">
            {props.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="mt-6 space-y-2 break-words text-[11px] leading-5 text-white/90">

            {props.email && (
              <p>
                {props.email}
              </p>
            )}

            {props.phone && (
              <p>
                {props.phone}
              </p>
            )}

            {props.location && (
              <p>
                {props.location}
              </p>
            )}

          </div>

          {(props.linkedinUrl ||
            props.githubUrl ||
            props.portfolioUrl) && (

            <div className="mt-7">

              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                Links
              </p>

              <div className="mt-3 space-y-2 text-xs">

                {props.linkedinUrl && (
                  <a
                    href={
                      props.linkedinUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="block hover:underline"
                  >
                    LinkedIn
                  </a>
                )}

                {props.githubUrl && (
                  <a
                    href={
                      props.githubUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="block hover:underline"
                  >
                    GitHub
                  </a>
                )}

                {props.portfolioUrl && (
                  <a
                    href={
                      props.portfolioUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="block hover:underline"
                  >
                    Portfolio
                  </a>
                )}

              </div>

            </div>

          )}

          {props.skills.length >
            0 && (

            <div className="mt-8">

              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                Skills
              </p>

              <div className="mt-3 space-y-2 text-xs">

                {props.skills.map(
                  (
                    skill,
                    index
                  ) => (
                    <p
                      key={`${skill}-${index}`}
                    >
                      {skill}
                    </p>
                  )
                )}

              </div>

            </div>

          )}

        </aside>

        {/* RIGHT */}

        <div className="min-w-0">

          <h1 className="break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {props.name}
          </h1>

          <p
            className={`mt-2 text-sm font-semibold ${accentText[props.accentColor]}`}
          >
            {props.title}
          </p>

          <CreativeContent
            {...props}
          />

        </div>

      </div>

    </ResumePaper>
  );
}

/* =========================================================
   RESUME PAPER
========================================================= */

function ResumePaper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <article className="mx-auto min-h-[1050px] w-full max-w-[820px] bg-white px-7 py-8 shadow-md sm:px-10 sm:py-10 lg:px-12 lg:py-12">
      {children}
    </article>
  );
}

/* =========================================================
   CONTACT AREA
========================================================= */

function ContactArea(
  props: TemplateProps
) {
  return (
    <>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

        {props.phone && (
          <span>
            {props.phone}
          </span>
        )}

        {props.location && (
          <span>
            {props.location}
          </span>
        )}

        {props.email && (
          <span>
            {props.email}
          </span>
        )}

      </div>

      <ProfessionalLinks
        {...props}
      />
    </>
  );
}

/* =========================================================
   PROFESSIONAL LINKS
========================================================= */

function ProfessionalLinks({
  accentColor,
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  centered = false,
}: TemplateProps & {
  centered?: boolean;
}) {
  if (
    !linkedinUrl &&
    !githubUrl &&
    !portfolioUrl
  ) {
    return null;
  }

  return (
    <div
      className={`
        mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium
        ${accentText[accentColor]}
        ${
          centered
            ? "justify-center"
            : ""
        }
      `}
    >

      {linkedinUrl && (
        <a
          href={
            linkedinUrl
          }
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          LinkedIn
        </a>
      )}

      {githubUrl && (
        <a
          href={
            githubUrl
          }
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          GitHub
        </a>
      )}

      {portfolioUrl && (
        <a
          href={
            portfolioUrl
          }
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          Portfolio
        </a>
      )}

    </div>
  );
}

/* =========================================================
   STANDARD CONTENT
========================================================= */

function StandardContent({
  accentColor,
  summary,
  skills,
  experience,
  education,
  projects,

  coloredHeadings = false,
  minimal = false,
  executive = false,
}: TemplateProps & {
  coloredHeadings?: boolean;
  minimal?: boolean;
  executive?: boolean;
}) {
  const headingClass =
    coloredHeadings
      ? accentText[
          accentColor
        ]
      : "text-slate-600";

  const sectionPadding =
    minimal
      ? "py-7"
      : "py-6";

  return (
    <>
      {/* SUMMARY */}

      {summary && (
        <ResumeSection
          title="Professional Summary"
          headingClass={
            headingClass
          }
          sectionPadding={
            sectionPadding
          }
          executive={
            executive
          }
        >
          <p className="whitespace-pre-wrap text-[13px] leading-6 text-slate-700 sm:text-sm">
            {summary}
          </p>
        </ResumeSection>
      )}

      {/* EXPERIENCE */}

      {experience.length >
        0 && (
        <ResumeSection
          title="Professional Experience"
          headingClass={
            headingClass
          }
          sectionPadding={
            sectionPadding
          }
          executive={
            executive
          }
        >
          <div className="space-y-6">

            {experience.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    index
                  }
                >

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">

                    <div className="min-w-0">

                      <h3 className="text-sm font-bold text-slate-950">
                        {item.job_title ||
                          "Job Title"}
                      </h3>

                      <p className="mt-0.5 text-sm font-semibold text-slate-700">
                        {item.company ||
                          "Company"}

                        {item.location
                          ? ` · ${item.location}`
                          : ""}
                      </p>

                    </div>

                    <p className="shrink-0 text-xs font-medium text-slate-500">
                      {item.start_date ||
                        ""}

                      {(item.start_date ||
                        item.end_date ||
                        item.currently_working) &&
                        " – "}

                      {item.currently_working
                        ? "Present"
                        : item.end_date ||
                          ""}
                    </p>

                  </div>

                  {item.description && (
                    <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-slate-700 sm:text-sm">
                      {
                        item.description
                      }
                    </p>
                  )}

                </div>
              )
            )}

          </div>
        </ResumeSection>
      )}

      {/* EDUCATION */}

      {education.length >
        0 && (
        <ResumeSection
          title="Education"
          headingClass={
            headingClass
          }
          sectionPadding={
            sectionPadding
          }
          executive={
            executive
          }
        >

          <div className="space-y-5">

            {education.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                >

                  <div className="min-w-0">

                    <h3 className="text-sm font-bold text-slate-950">
                      {
                        item.school
                      }
                    </h3>

                    <p className="mt-0.5 text-sm text-slate-700">
                      {item.degree ||
                        ""}

                      {item.degree &&
                      item.field_of_study
                        ? ", "
                        : ""}

                      {item.field_of_study ||
                        ""}
                    </p>

                  </div>

                  <p className="shrink-0 text-xs font-medium text-slate-500">
                    {item.start_date ||
                      ""}

                    {(item.start_date ||
                      item.end_date) &&
                      " – "}

                    {item.end_date ||
                      ""}
                  </p>

                </div>
              )
            )}

          </div>

        </ResumeSection>
      )}

      {/* PROJECTS */}

      {projects.length >
        0 && (
        <ResumeSection
          title="Projects"
          headingClass={
            headingClass
          }
          sectionPadding={
            sectionPadding
          }
          executive={
            executive
          }
        >

          <div className="space-y-5">

            {projects.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    index
                  }
                >

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

                    <h3 className="text-sm font-bold text-slate-950">
                      {
                        item.name
                      }
                    </h3>

                    {item.url && (
                      <a
                        href={
                          item.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={`break-all text-xs font-medium hover:underline ${accentText[accentColor]}`}
                      >
                        View project
                      </a>
                    )}

                  </div>

                  {item.description && (
                    <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-slate-700 sm:text-sm">
                      {
                        item.description
                      }
                    </p>
                  )}

                </div>
              )
            )}

          </div>

        </ResumeSection>
      )}

      {/* SKILLS */}

      {skills.length >
        0 && (
        <ResumeSection
          title="Skills"
          headingClass={
            headingClass
          }
          sectionPadding={
            sectionPadding
          }
          executive={
            executive
          }
        >

          <div className="flex flex-wrap gap-2">

            {skills.map(
              (
                skill,
                index
              ) => (
                <span
                  key={`${skill}-${index}`}
                  className={`
                    rounded-md px-2.5 py-1 text-xs font-medium
                    ${accentLightBackground[accentColor]}
                    ${accentText[accentColor]}
                  `}
                >
                  {skill}
                </span>
              )
            )}

          </div>

        </ResumeSection>
      )}

      {/* EMPTY */}

      {!summary &&
        experience.length ===
          0 &&
        education.length ===
          0 &&
        projects.length ===
          0 &&
        skills.length ===
          0 && (

        <div className="flex min-h-72 items-center justify-center text-center">

          <div>

            <p className="text-sm font-semibold text-slate-600">
              This resume does
              not have content
              yet.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Edit the resume
              and add your
              professional
              information.
            </p>

          </div>

        </div>

      )}
    </>
  );
}

/* =========================================================
   CREATIVE CONTENT
========================================================= */

function CreativeContent(
  props: TemplateProps
) {
  return (
    <>
      {props.summary && (
        <CreativeSection
          title="Profile"
          color={
            props.accentColor
          }
        >

          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {
              props.summary
            }
          </p>

        </CreativeSection>
      )}

      {props.experience.length >
        0 && (

        <CreativeSection
          title="Experience"
          color={
            props.accentColor
          }
        >

          <div className="space-y-5">

            {props.experience.map(
              (
                item,
                index
              ) => (

                <div
                  key={
                    index
                  }
                >

                  <h3 className="text-sm font-bold text-slate-950">
                    {item.job_title ||
                      "Job Title"}
                  </h3>

                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {item.company}

                    {item.location
                      ? ` · ${item.location}`
                      : ""}

                    {item.start_date
                      ? ` · ${item.start_date}`
                      : ""}

                    {item.currently_working
                      ? " – Present"
                      : item.end_date
                      ? ` – ${item.end_date}`
                      : ""}
                  </p>

                  {item.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {
                        item.description
                      }
                    </p>
                  )}

                </div>

              )
            )}

          </div>

        </CreativeSection>
      )}

      {props.education.length >
        0 && (

        <CreativeSection
          title="Education"
          color={
            props.accentColor
          }
        >

          <div className="space-y-4">

            {props.education.map(
              (
                item,
                index
              ) => (

                <div
                  key={
                    index
                  }
                >

                  <h3 className="text-sm font-bold text-slate-950">
                    {
                      item.school
                    }
                  </h3>

                  <p className="text-sm text-slate-600">
                    {item.degree ||
                      ""}

                    {item.degree &&
                    item.field_of_study
                      ? ", "
                      : ""}

                    {item.field_of_study ||
                      ""}
                  </p>

                </div>

              )
            )}

          </div>

        </CreativeSection>
      )}

      {props.projects.length >
        0 && (

        <CreativeSection
          title="Projects"
          color={
            props.accentColor
          }
        >

          <div className="space-y-4">

            {props.projects.map(
              (
                item,
                index
              ) => (

                <div
                  key={
                    index
                  }
                >

                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <h3 className="text-sm font-bold text-slate-950">
                      {
                        item.name
                      }
                    </h3>

                    {item.url && (
                      <a
                        href={
                          item.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={`text-xs font-medium hover:underline ${accentText[props.accentColor]}`}
                      >
                        View project
                      </a>
                    )}

                  </div>

                  {item.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {
                        item.description
                      }
                    </p>
                  )}

                </div>

              )
            )}

          </div>

        </CreativeSection>
      )}
    </>
  );
}

/* =========================================================
   STANDARD SECTION
========================================================= */

function ResumeSection({
  title,
  children,
  headingClass,
  sectionPadding,
  executive,
}: {
  title: string;

  children:
    ReactNode;

  headingClass:
    string;

  sectionPadding:
    string;

  executive:
    boolean;
}) {
  return (
    <section
      className={`border-b border-slate-200 last:border-b-0 ${sectionPadding}`}
    >

      <h2
        className={`
          mb-4 text-[11px] font-bold uppercase
          ${
            executive
              ? "font-serif tracking-[0.2em]"
              : "tracking-[0.16em]"
          }
          ${headingClass}
        `}
      >
        {title}
      </h2>

      {children}

    </section>
  );
}

/* =========================================================
   CREATIVE SECTION
========================================================= */

function CreativeSection({
  title,
  color,
  children,
}: {
  title: string;

  color:
    ResumeAccentColor;

  children:
    ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-6 last:border-b-0">

      <div className="mb-4 flex items-center gap-2">

        <span
          className={`h-5 w-1 rounded-full ${accentBackground[color]}`}
        />

        <h2
          className={`text-xs font-bold uppercase tracking-[0.14em] ${accentText[color]}`}
        >
          {title}
        </h2>

      </div>

      {children}

    </section>
  );
}

/* =========================================================
   HELPER
========================================================= */

function capitalize(
  value: string
) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

export default ResumeDetails;