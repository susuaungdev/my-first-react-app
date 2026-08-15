import {
  useState,
  type ReactNode,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import Sidebar from "../components/dashboard/Sidebar";

import {
  createResume,
  type ResumeExperience,
  type ResumeEducation,
  type ResumeProject,
  type ResumeTemplate,
  type ResumeAccentColor,
} from "../services/resumeService";

/* =========================================================
   TEMPLATE OPTIONS
========================================================= */

const templateOptions: {
  id: ResumeTemplate;
  name: string;
  description: string;
}[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional and ATS-friendly",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean with a strong header",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate and structured",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple with generous spacing",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Elegant for senior roles",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stronger visual personality",
  },
];

const colorOptions: {
  id: ResumeAccentColor;
  name: string;
  dotClass: string;
}[] = [
  {
    id: "blue",
    name: "Blue",
    dotClass: "bg-blue-600",
  },
  {
    id: "emerald",
    name: "Emerald",
    dotClass: "bg-emerald-600",
  },
  {
    id: "purple",
    name: "Purple",
    dotClass: "bg-purple-600",
  },
  {
    id: "rose",
    name: "Rose",
    dotClass: "bg-rose-600",
  },
  {
    id: "slate",
    name: "Slate",
    dotClass: "bg-slate-700",
  },
  {
    id: "orange",
    name: "Orange",
    dotClass: "bg-orange-600",
  },
];

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
   CREATE RESUME
========================================================= */

function CreateResume() {
  const navigate =
    useNavigate();

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
      ? JSON.parse(storedUser)
      : null;

  /* =========================================================
     DESIGN
  ========================================================= */

  const [
    selectedTemplate,
    setSelectedTemplate,
  ] =
    useState<ResumeTemplate>(
      "classic"
    );

  const [
    selectedAccentColor,
    setSelectedAccentColor,
  ] =
    useState<ResumeAccentColor>(
      "blue"
    );

  /* =========================================================
     BASIC DATA
  ========================================================= */

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    summary,
    setSummary,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    linkedinUrl,
    setLinkedinUrl,
  ] = useState("");

  const [
    githubUrl,
    setGithubUrl,
  ] = useState("");

  const [
    portfolioUrl,
    setPortfolioUrl,
  ] = useState("");

  const [
    skills,
    setSkills,
  ] = useState("");

  /* =========================================================
     EXPERIENCE
  ========================================================= */

  const [
    experience,
    setExperience,
  ] =
    useState<
      ResumeExperience[]
    >([
      {
        company: "",
        job_title: "",
        location: "",
        start_date: "",
        end_date: "",
        currently_working:
          false,
        description: "",
      },
    ]);

  /* =========================================================
     EDUCATION
  ========================================================= */

  const [
    education,
    setEducation,
  ] =
    useState<
      ResumeEducation[]
    >([
      {
        school: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
      },
    ]);

  /* =========================================================
     PROJECTS
  ========================================================= */

  const [
    projects,
    setProjects,
  ] =
    useState<
      ResumeProject[]
    >([
      {
        name: "",
        description: "",
        url: "",
      },
    ]);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

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
     EXPERIENCE ACTIONS
  ========================================================= */

  const updateExperience = (
    index: number,
    field:
      keyof ResumeExperience,
    value:
      | string
      | boolean
  ) => {
    setExperience(
      experience.map(
        (
          item,
          itemIndex
        ) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        company: "",
        job_title: "",
        location: "",
        start_date: "",
        end_date: "",
        currently_working:
          false,
        description: "",
      },
    ]);
  };

  const removeExperience = (
    index: number
  ) => {
    setExperience(
      experience.filter(
        (
          _,
          itemIndex
        ) =>
          itemIndex !== index
      )
    );
  };

  /* =========================================================
     EDUCATION ACTIONS
  ========================================================= */

  const updateEducation = (
    index: number,
    field:
      keyof ResumeEducation,
    value: string
  ) => {
    setEducation(
      education.map(
        (
          item,
          itemIndex
        ) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        school: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
      },
    ]);
  };

  const removeEducation = (
    index: number
  ) => {
    setEducation(
      education.filter(
        (
          _,
          itemIndex
        ) =>
          itemIndex !== index
      )
    );
  };

  /* =========================================================
     PROJECT ACTIONS
  ========================================================= */

  const updateProject = (
    index: number,
    field:
      keyof ResumeProject,
    value: string
  ) => {
    setProjects(
      projects.map(
        (
          item,
          itemIndex
        ) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };

  const addProject = () => {
    setProjects([
      ...projects,
      {
        name: "",
        description: "",
        url: "",
      },
    ]);
  };

  const removeProject = (
    index: number
  ) => {
    setProjects(
      projects.filter(
        (
          _,
          itemIndex
        ) =>
          itemIndex !== index
      )
    );
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(
        "Resume title is required."
      );

      toast.error(
        "Resume title is required."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSaving(true);
      setError("");

      const cleanedExperience =
        experience.filter(
          (item) =>
            item.company.trim() ||
            item.job_title.trim()
        );

      const cleanedEducation =
        education.filter(
          (item) =>
            item.school.trim()
        );

      const cleanedProjects =
        projects.filter(
          (item) =>
            item.name.trim()
        );

      await createResume({
        title:
          title.trim(),

        summary,

        phone,

        location,

        linkedin_url:
          linkedinUrl,

        github_url:
          githubUrl,

        portfolio_url:
          portfolioUrl,

        skills,

        experience:
          cleanedExperience,

        education:
          cleanedEducation,

        projects:
          cleanedProjects,

        template:
          selectedTemplate,

        accent_color:
          selectedAccentColor,
      });

      toast.success(
        "Resume created successfully."
      );

      navigate(
        "/resumes"
      );
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );

        toast.error(
          error.message
        );
      } else {
        setError(
          "Failed to create resume."
        );

        toast.error(
          "Failed to create resume."
        );
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     PREVIEW DATA
  ========================================================= */

  const previewSkills =
    skills
      .split(",")
      .map(
        (skill) =>
          skill.trim()
      )
      .filter(Boolean);

  const previewExperience =
    experience.filter(
      (item) =>
        item.company.trim() ||
        item.job_title.trim()
    );

  const previewEducation =
    education.filter(
      (item) =>
        item.school.trim()
    );

  const previewProjects =
    projects.filter(
      (item) =>
        item.name.trim()
    );

  /* =========================================================
     PAGE
  ========================================================= */

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
          ☰
        </button>

        <h1 className="text-lg font-bold text-blue-600">
          CareerFlow
        </h1>

        <div className="h-10 w-10" />
      </header>

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
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* PAGE HEADER */}

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Resume Builder
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create a resume
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Build your resume,
                choose a professional
                template, and preview
                it live while you type.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/resumes"
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Back to resumes
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              BUILDER GRID
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(440px,0.95fr)]">
            {/* =================================================
                LEFT FORM
            ================================================= */}

            <form
              onSubmit={
                handleSubmit
              }
              className="min-w-0 space-y-6"
            >
              {/* DESIGN */}

              <Section
                title="Resume design"
                description="Choose a template and accent color. You can change these without changing your resume content."
              >
                {/* TEMPLATES */}

                <div>
                  <Label>
                    Template
                  </Label>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {templateOptions.map(
                      (template) => {
                        const active =
                          selectedTemplate ===
                          template.id;

                        return (
                          <button
                            key={
                              template.id
                            }
                            type="button"
                            onClick={() =>
                              setSelectedTemplate(
                                template.id
                              )
                            }
                            className={`
                              overflow-hidden rounded-xl border-2 bg-white text-left transition
                              ${
                                active
                                  ? "border-blue-600 ring-4 ring-blue-50"
                                  : "border-slate-200 hover:border-slate-300"
                              }
                            `}
                          >
                            <TemplateThumbnail
                              template={
                                template.id
                              }
                              color={
                                selectedAccentColor
                              }
                            />

                            <div className="border-t border-slate-100 px-3 py-3">
                              <div className="flex items-center justify-between gap-2">
                                <p
                                  className={`text-sm font-semibold ${
                                    active
                                      ? "text-blue-700"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {
                                    template.name
                                  }
                                </p>

                                {active && (
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                    ✓
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                                {
                                  template.description
                                }
                              </p>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* COLORS */}

                <div className="mt-6">
                  <Label>
                    Accent color
                  </Label>

                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(
                      (color) => {
                        const active =
                          selectedAccentColor ===
                          color.id;

                        return (
                          <button
                            key={
                              color.id
                            }
                            type="button"
                            onClick={() =>
                              setSelectedAccentColor(
                                color.id
                              )
                            }
                            className={`
                              flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition
                              ${
                                active
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              }
                            `}
                          >
                            <span
                              className={`h-4 w-4 rounded-full ${color.dotClass}`}
                            />

                            {
                              color.name
                            }
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </Section>

              {/* BASIC */}

              <Section
                title="Resume information"
                description="Give this resume a title and add your professional summary."
              >
                <div className="space-y-4">
                  <InputField
                    label="Resume title"
                    value={title}
                    onChange={
                      setTitle
                    }
                    placeholder="Frontend Developer Resume"
                  />

                  <div>
                    <Label>
                      Professional
                      summary
                    </Label>

                    <textarea
                      rows={5}
                      value={
                        summary
                      }
                      onChange={(e) =>
                        setSummary(
                          e.target
                            .value
                        )
                      }
                      placeholder="Write a short professional summary..."
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </Section>

              {/* CONTACT */}

              <Section
                title="Contact information"
                description="Contact details shown on the resume."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Phone"
                    value={phone}
                    onChange={
                      setPhone
                    }
                    placeholder="+95 9..."
                  />

                  <InputField
                    label="Location"
                    value={
                      location
                    }
                    onChange={
                      setLocation
                    }
                    placeholder="Yangon, Myanmar"
                  />
                </div>
              </Section>

              {/* LINKS */}

              <Section
                title="Professional links"
                description="Add professional profiles and websites."
              >
                <div className="space-y-4">
                  <InputField
                    label="LinkedIn"
                    value={
                      linkedinUrl
                    }
                    onChange={
                      setLinkedinUrl
                    }
                    placeholder="https://linkedin.com/in/username"
                  />

                  <InputField
                    label="GitHub"
                    value={
                      githubUrl
                    }
                    onChange={
                      setGithubUrl
                    }
                    placeholder="https://github.com/username"
                  />

                  <InputField
                    label="Portfolio"
                    value={
                      portfolioUrl
                    }
                    onChange={
                      setPortfolioUrl
                    }
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </Section>

              {/* SKILLS */}

              <Section
                title="Skills"
                description="List your most relevant skills."
              >
                <Label>
                  Skills
                </Label>

                <textarea
                  rows={3}
                  value={skills}
                  onChange={(e) =>
                    setSkills(
                      e.target.value
                    )
                  }
                  placeholder="React, TypeScript, Node.js, MySQL..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Separate each skill
                  with a comma.
                </p>
              </Section>

              {/* =================================================
                  EXPERIENCE
              ================================================= */}

              <Section
                title="Work experience"
                description="Add your relevant professional experience."
              >
                <div className="space-y-5">
                  {experience.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-800">
                            Experience{" "}
                            {index +
                              1}
                          </h3>

                          {experience.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeExperience(
                                  index
                                )
                              }
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <InputField
                            label="Company"
                            value={
                              item.company
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "company",
                                value
                              )
                            }
                            placeholder="Company name"
                          />

                          <InputField
                            label="Job title"
                            value={
                              item.job_title
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "job_title",
                                value
                              )
                            }
                            placeholder="Frontend Developer"
                          />

                          <InputField
                            label="Location"
                            value={
                              item.location ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "location",
                                value
                              )
                            }
                            placeholder="Yangon"
                          />

                          <div />

                          <InputField
                            label="Start date"
                            value={
                              item.start_date ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "start_date",
                                value
                              )
                            }
                            placeholder="2025-01"
                          />

                          <InputField
                            label="End date"
                            value={
                              item.end_date ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "end_date",
                                value
                              )
                            }
                            placeholder="2026-01"
                          />

                          <label className="flex items-center gap-2 sm:col-span-2">
                            <input
                              type="checkbox"
                              checked={
                                item.currently_working ||
                                false
                              }
                              onChange={(
                                e
                              ) =>
                                updateExperience(
                                  index,
                                  "currently_working",
                                  e
                                    .target
                                    .checked
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300 text-blue-600"
                            />

                            <span className="text-sm text-slate-600">
                              I currently
                              work here
                            </span>
                          </label>

                          <div className="sm:col-span-2">
                            <Label>
                              Description
                            </Label>

                            <textarea
                              rows={4}
                              value={
                                item.description ||
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                updateExperience(
                                  index,
                                  "description",
                                  e
                                    .target
                                    .value
                                )
                              }
                              placeholder="Describe your responsibilities and achievements..."
                              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={
                      addExperience
                    }
                    className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
                  >
                    + Add experience
                  </button>
                </div>
              </Section>

              {/* =================================================
                  EDUCATION
              ================================================= */}

              <Section
                title="Education"
                description="Add schools, degrees, and qualifications."
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
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-800">
                            Education{" "}
                            {index +
                              1}
                          </h3>

                          {education.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeEducation(
                                  index
                                )
                              }
                              className="text-xs font-semibold text-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <InputField
                            label="School"
                            value={
                              item.school
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "school",
                                value
                              )
                            }
                            placeholder="University name"
                          />

                          <InputField
                            label="Degree"
                            value={
                              item.degree ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "degree",
                                value
                              )
                            }
                            placeholder="Bachelor's degree"
                          />

                          <InputField
                            label="Field of study"
                            value={
                              item.field_of_study ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "field_of_study",
                                value
                              )
                            }
                            placeholder="Computer Science"
                          />

                          <div />

                          <InputField
                            label="Start date"
                            value={
                              item.start_date ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "start_date",
                                value
                              )
                            }
                            placeholder="2021"
                          />

                          <InputField
                            label="End date"
                            value={
                              item.end_date ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "end_date",
                                value
                              )
                            }
                            placeholder="2025"
                          />
                        </div>
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={
                      addEducation
                    }
                    className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
                  >
                    + Add education
                  </button>
                </div>
              </Section>

              {/* =================================================
                  PROJECTS
              ================================================= */}

              <Section
                title="Projects"
                description="Add projects that demonstrate your work."
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
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-800">
                            Project{" "}
                            {index +
                              1}
                          </h3>

                          {projects.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeProject(
                                  index
                                )
                              }
                              className="text-xs font-semibold text-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <InputField
                            label="Project name"
                            value={
                              item.name
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "name",
                                value
                              )
                            }
                            placeholder="CareerFlow"
                          />

                          <InputField
                            label="Project URL"
                            value={
                              item.url ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "url",
                                value
                              )
                            }
                            placeholder="https://github.com/..."
                          />

                          <div>
                            <Label>
                              Description
                            </Label>

                            <textarea
                              rows={4}
                              value={
                                item.description ||
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                updateProject(
                                  index,
                                  "description",
                                  e
                                    .target
                                    .value
                                )
                              }
                              placeholder="Describe the project..."
                              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={
                      addProject
                    }
                    className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
                  >
                    + Add project
                  </button>
                </div>
              </Section>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/resumes"
                    )
                  }
                  disabled={
                    saving
                  }
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Creating resume..."
                    : "Create resume"}
                </button>
              </div>
            </form>

            {/* =================================================
                LIVE PREVIEW
            ================================================= */}

            <aside className="min-w-0">
              <div className="xl:sticky xl:top-6">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Live preview
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        templateOptions.find(
                          (item) =>
                            item.id ===
                            selectedTemplate
                        )?.name
                      }{" "}
                      template ·{" "}
                      {
                        colorOptions.find(
                          (item) =>
                            item.id ===
                            selectedAccentColor
                        )?.name
                      }
                    </p>
                  </div>

                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
                    Live
                  </span>
                </div>

                <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-sm sm:p-5">
                  <ResumePreview
                    template={
                      selectedTemplate
                    }
                    accentColor={
                      selectedAccentColor
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
                      title
                    }
                    summary={
                      summary
                    }
                    phone={
                      phone
                    }
                    location={
                      location
                    }
                    linkedinUrl={
                      linkedinUrl
                    }
                    githubUrl={
                      githubUrl
                    }
                    portfolioUrl={
                      portfolioUrl
                    }
                    skills={
                      previewSkills
                    }
                    experience={
                      previewExperience
                    }
                    education={
                      previewEducation
                    }
                    projects={
                      previewProjects
                    }
                  />
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   RESUME PREVIEW
========================================================= */

type ResumePreviewProps = {
  template: ResumeTemplate;
  accentColor: ResumeAccentColor;

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

function ResumePreview({
  template,
  accentColor,

  name,
  email,

  title,
  summary,
  phone,
  location,

  linkedinUrl,
  githubUrl,
  portfolioUrl,

  skills,
  experience,
  education,
  projects,
}: ResumePreviewProps) {
  if (
    template ===
    "modern"
  ) {
    return (
      <ModernTemplate
        accentColor={
          accentColor
        }
        name={name}
        email={email}
        title={title}
        summary={
          summary
        }
        phone={phone}
        location={
          location
        }
        linkedinUrl={
          linkedinUrl
        }
        githubUrl={
          githubUrl
        }
        portfolioUrl={
          portfolioUrl
        }
        skills={skills}
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
    );
  }

  if (
    template ===
    "professional"
  ) {
    return (
      <ProfessionalTemplate
        accentColor={
          accentColor
        }
        name={name}
        email={email}
        title={title}
        summary={
          summary
        }
        phone={phone}
        location={
          location
        }
        linkedinUrl={
          linkedinUrl
        }
        githubUrl={
          githubUrl
        }
        portfolioUrl={
          portfolioUrl
        }
        skills={skills}
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
    );
  }

  if (
    template ===
    "minimal"
  ) {
    return (
      <MinimalTemplate
        accentColor={
          accentColor
        }
        name={name}
        email={email}
        title={title}
        summary={
          summary
        }
        phone={phone}
        location={
          location
        }
        linkedinUrl={
          linkedinUrl
        }
        githubUrl={
          githubUrl
        }
        portfolioUrl={
          portfolioUrl
        }
        skills={skills}
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
    );
  }

  if (
    template ===
    "executive"
  ) {
    return (
      <ExecutiveTemplate
        accentColor={
          accentColor
        }
        name={name}
        email={email}
        title={title}
        summary={
          summary
        }
        phone={phone}
        location={
          location
        }
        linkedinUrl={
          linkedinUrl
        }
        githubUrl={
          githubUrl
        }
        portfolioUrl={
          portfolioUrl
        }
        skills={skills}
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
    );
  }

  if (
    template ===
    "creative"
  ) {
    return (
      <CreativeTemplate
        accentColor={
          accentColor
        }
        name={name}
        email={email}
        title={title}
        summary={
          summary
        }
        phone={phone}
        location={
          location
        }
        linkedinUrl={
          linkedinUrl
        }
        githubUrl={
          githubUrl
        }
        portfolioUrl={
          portfolioUrl
        }
        skills={skills}
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
    );
  }

  return (
    <ClassicTemplate
      accentColor={
        accentColor
      }
      name={name}
      email={email}
      title={title}
      summary={summary}
      phone={phone}
      location={
        location
      }
      linkedinUrl={
        linkedinUrl
      }
      githubUrl={
        githubUrl
      }
      portfolioUrl={
        portfolioUrl
      }
      skills={skills}
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
  );
}

/* =========================================================
   SHARED TEMPLATE PROPS
========================================================= */

type TemplateProps =
  Omit<
    ResumePreviewProps,
    "template"
  >;

/* =========================================================
   CLASSIC TEMPLATE
========================================================= */

function ClassicTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>
      <div
        className={`border-b-2 pb-5 ${accentBorder[props.accentColor]}`}
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {props.name}
        </h1>

        <p
          className={`mt-1 text-sm font-semibold ${accentText[props.accentColor]}`}
        >
          {props.title ||
            "Professional Title"}
        </p>

        <ContactLine
          {...props}
        />
      </div>

      <StandardResumeContent
        {...props}
      />
    </ResumePaper>
  );
}

/* =========================================================
   MODERN TEMPLATE
========================================================= */

function ModernTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>
      <div
        className={`${accentBackground[props.accentColor]} -mx-6 -mt-8 px-6 py-8 text-white sm:-mx-10 sm:-mt-10 sm:px-10`}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          {props.name}
        </h1>

        <p className="mt-1 text-sm font-medium text-white/90">
          {props.title ||
            "Professional Title"}
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
      </div>

      <div className="pt-5">
        <StandardResumeContent
          {...props}
          coloredHeadings
        />
      </div>
    </ResumePaper>
  );
}

/* =========================================================
   PROFESSIONAL TEMPLATE
========================================================= */

function ProfessionalTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>
      <div className="grid grid-cols-1 gap-6 border-b border-slate-300 pb-6 sm:grid-cols-[1fr_auto]">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-[0.2em] ${accentText[props.accentColor]}`}
          >
            Curriculum Vitae
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            {props.name}
          </h1>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            {props.title ||
              "Professional Title"}
          </p>
        </div>

        <div className="text-xs leading-5 text-slate-500 sm:text-right">
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
            <p>
              {props.email}
            </p>
          )}
        </div>
      </div>

      <StandardResumeContent
        {...props}
        coloredHeadings
      />
    </ResumePaper>
  );
}

/* =========================================================
   MINIMAL TEMPLATE
========================================================= */

function MinimalTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>
      <div className="pb-7 text-center">
        <h1 className="text-3xl font-medium tracking-[0.04em] text-slate-900">
          {props.name}
        </h1>

        <p
          className={`mt-2 text-xs font-semibold uppercase tracking-[0.18em] ${accentText[props.accentColor]}`}
        >
          {props.title ||
            "Professional Title"}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
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
      </div>

      <StandardResumeContent
        {...props}
        minimal
      />
    </ResumePaper>
  );
}

/* =========================================================
   EXECUTIVE TEMPLATE
========================================================= */

function ExecutiveTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>
      <div className="border-y border-slate-900 py-6 text-center">
        <h1 className="font-serif text-4xl font-semibold tracking-wide text-slate-950">
          {props.name}
        </h1>

        <p
          className={`mt-2 text-xs font-bold uppercase tracking-[0.25em] ${accentText[props.accentColor]}`}
        >
          {props.title ||
            "Executive Profile"}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
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
      </div>

      <StandardResumeContent
        {...props}
        executive
      />
    </ResumePaper>
  );
}

/* =========================================================
   CREATIVE TEMPLATE
========================================================= */

function CreativeTemplate(
  props: TemplateProps
) {
  return (
    <ResumePaper>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[150px_1fr]">
        <div
          className={`${accentBackground[props.accentColor]} rounded-sm px-4 py-6 text-white`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl font-bold">
            {props.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="mt-6 space-y-2 break-words text-[11px] text-white/90">
            {props.email && (
              <p>
                {
                  props.email
                }
              </p>
            )}

            {props.phone && (
              <p>
                {
                  props.phone
                }
              </p>
            )}

            {props.location && (
              <p>
                {
                  props.location
                }
              </p>
            )}
          </div>

          {props.skills.length >
            0 && (
            <div className="mt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
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
                      {
                        skill
                      }
                    </p>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            {props.name}
          </h1>

          <p
            className={`mt-1 text-sm font-semibold ${accentText[props.accentColor]}`}
          >
            {props.title ||
              "Professional Title"}
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
    <div className="mx-auto min-h-[900px] w-full max-w-[760px] bg-white px-6 py-8 text-slate-800 shadow-sm sm:px-10 sm:py-10">
      {children}
    </div>
  );
}

/* =========================================================
   CONTACT LINE
========================================================= */

function ContactLine(
  props: TemplateProps
) {
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
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

      <div
        className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${accentText[props.accentColor]}`}
      >
        {props.linkedinUrl && (
          <span>
            LinkedIn
          </span>
        )}

        {props.githubUrl && (
          <span>
            GitHub
          </span>
        )}

        {props.portfolioUrl && (
          <span>
            Portfolio
          </span>
        )}
      </div>
    </>
  );
}

/* =========================================================
   STANDARD TEMPLATE CONTENT
========================================================= */

function StandardResumeContent({
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
      : "text-slate-700";

  const sectionSpacing =
    minimal
      ? "py-7"
      : "py-5";

  return (
    <>
      {summary && (
        <ResumeContentSection
          title="Professional Summary"
          headingClass={
            headingClass
          }
          className={
            sectionSpacing
          }
          executive={
            executive
          }
        >
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {summary}
          </p>
        </ResumeContentSection>
      )}

      {experience.length >
        0 && (
        <ResumeContentSection
          title="Experience"
          headingClass={
            headingClass
          }
          className={
            sectionSpacing
          }
          executive={
            executive
          }
        >
          <div className="space-y-5">
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
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {item.job_title ||
                          "Job Title"}
                      </h3>

                      <p className="text-sm font-medium text-slate-600">
                        {item.company ||
                          "Company"}

                        {item.location
                          ? ` · ${item.location}`
                          : ""}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs text-slate-500">
                      {item.start_date ||
                        ""}

                      {(item.start_date ||
                        item.end_date ||
                        item.currently_working) &&
                        " — "}

                      {item.currently_working
                        ? "Present"
                        : item.end_date ||
                          ""}
                    </p>
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
        </ResumeContentSection>
      )}

      {education.length >
        0 && (
        <ResumeContentSection
          title="Education"
          headingClass={
            headingClass
          }
          className={
            sectionSpacing
          }
          executive={
            executive
          }
        >
          <div className="space-y-4">
            {education.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
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

                  <p className="shrink-0 text-xs text-slate-500">
                    {item.start_date ||
                      ""}

                    {(item.start_date ||
                      item.end_date) &&
                      " — "}

                    {item.end_date ||
                      ""}
                  </p>
                </div>
              )
            )}
          </div>
        </ResumeContentSection>
      )}

      {projects.length >
        0 && (
        <ResumeContentSection
          title="Projects"
          headingClass={
            headingClass
          }
          className={
            sectionSpacing
          }
          executive={
            executive
          }
        >
          <div className="space-y-4">
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {
                        item.name
                      }
                    </h3>

                    {item.url && (
                      <span
                        className={`text-xs ${accentText[accentColor]}`}
                      >
                        Project
                        link
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {
                        item.description
                      }
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </ResumeContentSection>
      )}

      {skills.length >
        0 && (
        <ResumeContentSection
          title="Skills"
          headingClass={
            headingClass
          }
          className={
            sectionSpacing
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
                  className={`${accentLightBackground[accentColor]} rounded px-2.5 py-1 text-xs font-medium ${accentText[accentColor]}`}
                >
                  {
                    skill
                  }
                </span>
              )
            )}
          </div>
        </ResumeContentSection>
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
                  <h3 className="text-sm font-bold text-slate-900">
                    {item.job_title ||
                      "Job Title"}
                  </h3>

                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {item.company}

                    {item.start_date
                      ? ` · ${item.start_date}`
                      : ""}

                    {item.currently_working
                      ? " — Present"
                      : item.end_date
                      ? ` — ${item.end_date}`
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
                  <h3 className="text-sm font-bold text-slate-900">
                    {
                      item.school
                    }
                  </h3>

                  <p className="text-sm text-slate-600">
                    {item.degree}

                    {item.degree &&
                    item.field_of_study
                      ? ", "
                      : ""}

                    {
                      item.field_of_study
                    }
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
                  <h3 className="text-sm font-bold text-slate-900">
                    {
                      item.name
                    }
                  </h3>

                  {item.description && (
                    <p className="mt-1 text-sm leading-6 text-slate-700">
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
   RESUME CONTENT SECTION
========================================================= */

function ResumeContentSection({
  title,
  children,
  headingClass,
  className = "",
  executive = false,
}: {
  title: string;
  children: ReactNode;
  headingClass: string;
  className?: string;
  executive?: boolean;
}) {
  return (
    <section
      className={`border-b border-slate-200 last:border-0 ${className}`}
    >
      <h2
        className={`
          mb-3 text-xs font-bold uppercase
          ${
            executive
              ? "font-serif tracking-[0.2em]"
              : "tracking-[0.12em]"
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
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-5 last:border-0">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`h-5 w-1 rounded-full ${accentBackground[color]}`}
        />

        <h2
          className={`text-xs font-bold uppercase tracking-[0.12em] ${accentText[color]}`}
        >
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   TEMPLATE THUMBNAILS
========================================================= */

function TemplateThumbnail({
  template,
  color,
}: {
  template:
    ResumeTemplate;
  color:
    ResumeAccentColor;
}) {
  return (
    <div className="h-32 bg-slate-50 p-3">
      <div className="h-full overflow-hidden bg-white shadow-sm">
        {template ===
          "modern" && (
          <>
            <div
              className={`h-8 ${accentBackground[color]}`}
            />

            <div className="space-y-2 p-2">
              <div className="h-1.5 w-1/2 rounded bg-slate-800" />
              <div className="h-1 w-3/4 rounded bg-slate-200" />
              <div className="h-1 w-full rounded bg-slate-100" />
              <div className="h-1 w-5/6 rounded bg-slate-100" />
            </div>
          </>
        )}

        {template ===
          "classic" && (
          <div className="p-3">
            <div className="h-2 w-2/3 rounded bg-slate-800" />

            <div
              className={`mt-1 h-1 w-1/3 rounded ${accentBackground[color]}`}
            />

            <div className="mt-2 border-t border-slate-400" />

            <div className="mt-3 space-y-2">
              <div className="h-1 w-1/4 bg-slate-300" />
              <div className="h-1 w-full bg-slate-100" />
              <div className="h-1 w-5/6 bg-slate-100" />
              <div className="h-1 w-1/4 bg-slate-300" />
              <div className="h-1 w-full bg-slate-100" />
            </div>
          </div>
        )}

        {template ===
          "professional" && (
          <div className="p-3">
            <div
              className={`h-1 w-1/4 ${accentBackground[color]}`}
            />

            <div className="mt-2 h-2 w-2/3 bg-slate-800" />

            <div className="mt-3 border-t border-slate-200" />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <div className="h-1 w-1/2 bg-slate-300" />
                <div className="h-1 w-full bg-slate-100" />
                <div className="h-1 w-full bg-slate-100" />
              </div>

              <div className="space-y-2">
                <div className="h-1 w-1/2 bg-slate-300" />
                <div className="h-1 w-full bg-slate-100" />
              </div>
            </div>
          </div>
        )}

        {template ===
          "minimal" && (
          <div className="p-4 text-center">
            <div className="mx-auto h-2 w-1/2 bg-slate-800" />

            <div
              className={`mx-auto mt-2 h-1 w-1/3 ${accentBackground[color]}`}
            />

            <div className="mx-auto mt-4 h-px w-4/5 bg-slate-200" />

            <div className="mx-auto mt-4 space-y-3">
              <div className="mx-auto h-1 w-1/4 bg-slate-200" />
              <div className="h-1 w-full bg-slate-100" />
              <div className="h-1 w-5/6 bg-slate-100" />
            </div>
          </div>
        )}

        {template ===
          "executive" && (
          <div className="p-3">
            <div className="border-y border-slate-700 py-3 text-center">
              <div className="mx-auto h-2 w-2/3 bg-slate-800" />

              <div
                className={`mx-auto mt-2 h-1 w-1/3 ${accentBackground[color]}`}
              />
            </div>

            <div className="mt-3 space-y-2">
              <div className="h-1 w-1/4 bg-slate-300" />
              <div className="h-1 w-full bg-slate-100" />
              <div className="h-1 w-4/5 bg-slate-100" />
            </div>
          </div>
        )}

        {template ===
          "creative" && (
          <div className="grid h-full grid-cols-[35%_1fr]">
            <div
              className={`${accentBackground[color]} p-2`}
            >
              <div className="h-5 w-5 rounded-full bg-white/30" />

              <div className="mt-4 space-y-2">
                <div className="h-1 w-full bg-white/30" />
                <div className="h-1 w-4/5 bg-white/30" />
                <div className="h-1 w-full bg-white/30" />
              </div>
            </div>

            <div className="p-2">
              <div className="h-2 w-3/4 bg-slate-800" />

              <div
                className={`mt-1 h-1 w-1/2 ${accentBackground[color]}`}
              />

              <div className="mt-4 space-y-2">
                <div className="h-1 w-1/3 bg-slate-300" />
                <div className="h-1 w-full bg-slate-100" />
                <div className="h-1 w-4/5 bg-slate-100" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FORM UI
========================================================= */

type SectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function Section({
  title,
  description,
  children,
}: SectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function Label({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

type InputFieldProps = {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  placeholder?: string;
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  return (
    <div className="min-w-0">
      <Label>
        {label}
      </Label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

export default CreateResume;