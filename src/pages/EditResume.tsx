import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import Sidebar from "../components/dashboard/Sidebar";

import {
  getResumeById,
  updateResume,
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
}[] = [
  {
    id: "classic",
    name: "Classic",
  },
  {
    id: "modern",
    name: "Modern",
  },
  {
    id: "professional",
    name: "Professional",
  },
  {
    id: "minimal",
    name: "Minimal",
  },
  {
    id: "executive",
    name: "Executive",
  },
  {
    id: "creative",
    name: "Creative",
  },
];

const colorOptions: {
  id: ResumeAccentColor;
  name: string;
  className: string;
}[] = [
  {
    id: "blue",
    name: "Blue",
    className: "bg-blue-600",
  },
  {
    id: "emerald",
    name: "Emerald",
    className: "bg-emerald-600",
  },
  {
    id: "purple",
    name: "Purple",
    className: "bg-purple-600",
  },
  {
    id: "rose",
    name: "Rose",
    className: "bg-rose-600",
  },
  {
    id: "slate",
    name: "Slate",
    className: "bg-slate-700",
  },
  {
    id: "orange",
    name: "Orange",
    className: "bg-orange-600",
  },
];

/* =========================================================
   PAGE
========================================================= */

function EditResume() {
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

  const [title, setTitle] =
    useState("");

  const [summary, setSummary] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [location, setLocation] =
    useState("");

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

  const [skills, setSkills] =
    useState("");

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

  const [
    experience,
    setExperience,
  ] =
    useState<
      ResumeExperience[]
    >([]);

  const [
    education,
    setEducation,
  ] =
    useState<
      ResumeEducation[]
    >([]);

  const [
    projects,
    setProjects,
  ] =
    useState<
      ResumeProject[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

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
     PARSE JSON
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

          toast.error(
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

          toast.error(
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

          const resume =
            data.resume;

          setTitle(
            resume.title || ""
          );

          setSummary(
            resume.summary || ""
          );

          setPhone(
            resume.phone || ""
          );

          setLocation(
            resume.location || ""
          );

          setLinkedinUrl(
            resume.linkedin_url ||
              ""
          );

          setGithubUrl(
            resume.github_url ||
              ""
          );

          setPortfolioUrl(
            resume.portfolio_url ||
              ""
          );

          setSkills(
            resume.skills || ""
          );

          setSelectedTemplate(
            resume.template ||
              "classic"
          );

          setSelectedAccentColor(
            resume.accent_color ||
              "blue"
          );

          const loadedExperience =
            parseArray<ResumeExperience>(
              resume.experience
            );

          const loadedEducation =
            parseArray<ResumeEducation>(
              resume.education
            );

          const loadedProjects =
            parseArray<ResumeProject>(
              resume.projects
            );

          setExperience(
            loadedExperience.length >
              0
              ? loadedExperience
              : [
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
                ]
          );

          setEducation(
            loadedEducation.length >
              0
              ? loadedEducation
              : [
                  {
                    school: "",
                    degree: "",
                    field_of_study:
                      "",
                    start_date: "",
                    end_date: "",
                  },
                ]
          );

          setProjects(
            loadedProjects.length >
              0
              ? loadedProjects
              : [
                  {
                    name: "",
                    description: "",
                    url: "",
                  },
                ]
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

            toast.error(
              error.message
            );
          } else {
            setError(
              "Failed to load resume."
            );

            toast.error(
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
     EXPERIENCE
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
     EDUCATION
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
     PROJECTS
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

    if (!id) {
      toast.error(
        "Invalid resume ID."
      );

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

      toast.error(
        "Invalid resume ID."
      );

      return;
    }

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

      await updateResume(
        resumeId,
        {
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
        }
      );

      toast.success(
        "Resume updated successfully."
      );

      navigate(
        `/resumes/${resumeId}`
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

        toast.error(
          error.message
        );
      } else {
        setError(
          "Failed to update resume."
        );

        toast.error(
          "Failed to update resume."
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

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* HEADER */}

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-blue-600">
                Resume Builder
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Edit resume
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Update your resume content,
                template, and color theme.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/resumes/${id}`
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Cancel editing
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">

            {/* =================================================
                FORM
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
                description="Change the template and accent color without changing your resume content."
              >

                <Label>
                  Template
                </Label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                  {templateOptions.map(
                    (
                      option
                    ) => {

                      const active =
                        selectedTemplate ===
                        option.id;

                      return (
                        <button
                          key={
                            option.id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedTemplate(
                              option.id
                            )
                          }
                          className={`
                            rounded-xl border-2 p-4 text-left transition
                            ${
                              active
                                ? "border-blue-600 bg-blue-50 ring-4 ring-blue-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between gap-2">

                            <span
                              className={`text-sm font-semibold ${
                                active
                                  ? "text-blue-700"
                                  : "text-slate-800"
                              }`}
                            >
                              {
                                option.name
                              }
                            </span>

                            {active && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                ✓
                              </span>
                            )}

                          </div>
                        </button>
                      );
                    }
                  )}

                </div>

                <div className="mt-6">

                  <Label>
                    Accent color
                  </Label>

                  <div className="flex flex-wrap gap-2">

                    {colorOptions.map(
                      (
                        color
                      ) => {

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
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }
                            `}
                          >
                            <span
                              className={`h-4 w-4 rounded-full ${color.className}`}
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

              {/* RESUME INFORMATION */}

              <Section
                title="Resume information"
                description="Update your resume title and professional summary."
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
                      Professional summary
                    </Label>

                    <textarea
                      rows={5}
                      value={
                        summary
                      }
                      onChange={(e) =>
                        setSummary(
                          e.target.value
                        )
                      }
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

              </Section>

              {/* CONTACT */}

              <Section
                title="Contact information"
                description="Contact details displayed on the resume."
              >

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InputField
                    label="Phone"
                    value={phone}
                    onChange={
                      setPhone
                    }
                  />

                  <InputField
                    label="Location"
                    value={
                      location
                    }
                    onChange={
                      setLocation
                    }
                  />

                </div>

              </Section>

              {/* LINKS */}

              <Section
                title="Professional links"
                description="Update your LinkedIn, GitHub, and portfolio links."
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
                  />

                  <InputField
                    label="GitHub"
                    value={
                      githubUrl
                    }
                    onChange={
                      setGithubUrl
                    }
                  />

                  <InputField
                    label="Portfolio"
                    value={
                      portfolioUrl
                    }
                    onChange={
                      setPortfolioUrl
                    }
                  />

                </div>

              </Section>

              {/* SKILLS */}

              <Section
                title="Skills"
                description="Update the skills relevant to this resume."
              >

                <textarea
                  rows={3}
                  value={
                    skills
                  }
                  onChange={(e) =>
                    setSkills(
                      e.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

              </Section>

              {/* EXPERIENCE */}

              <Section
                title="Work experience"
                description="Update your relevant professional experience."
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

                        <div className="mb-4 flex items-center justify-between">

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
                              className="text-xs font-semibold text-red-600"
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
                                  e.target.checked
                                )
                              }
                            />

                            <span className="text-sm text-slate-600">
                              I currently work here
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
                                  e.target.value
                                )
                              }
                              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    + Add experience
                  </button>

                </div>

              </Section>

              {/* EDUCATION */}

              <Section
                title="Education"
                description="Update your education and qualifications."
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

                        <div className="mb-4 flex items-center justify-between">

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
                    className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    + Add education
                  </button>

                </div>

              </Section>

              {/* PROJECTS */}

              <Section
                title="Projects"
                description="Update projects included in this resume."
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

                        <div className="mb-4 flex items-center justify-between">

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
                                  e.target.value
                                )
                              }
                              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
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
                      `/resumes/${id}`
                    )
                  }
                  disabled={
                    saving
                  }
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                    ? "Saving changes..."
                    : "Save changes"}
                </button>

              </div>

            </form>

            {/* =================================================
                LIVE PREVIEW
            ================================================= */}

            <aside className="min-w-0">

              <div className="xl:sticky xl:top-6">

                <div className="mb-3">

                  <h2 className="text-sm font-bold text-slate-900">
                    Live preview
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedTemplate} ·{" "}
                    {selectedAccentColor}
                  </p>

                </div>

                <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-sm sm:p-5">

                  <SimplePreview
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
                    template={
                      selectedTemplate
                    }
                    accentColor={
                      selectedAccentColor
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
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
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
   PREVIEW
========================================================= */

type SimplePreviewProps = {
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
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  template: ResumeTemplate;
  accentColor: ResumeAccentColor;
};

type AccentClasses = {
  text: string;
  bg: string;
  lightBg: string;
  border: string;
};

const previewAccentClasses: Record<
  ResumeAccentColor,
  AccentClasses
> = {
  blue: {
    text: "text-blue-700",
    bg: "bg-blue-700",
    lightBg: "bg-blue-50",
    border: "border-blue-700",
  },
  emerald: {
    text: "text-emerald-700",
    bg: "bg-emerald-700",
    lightBg: "bg-emerald-50",
    border: "border-emerald-700",
  },
  purple: {
    text: "text-purple-700",
    bg: "bg-purple-700",
    lightBg: "bg-purple-50",
    border: "border-purple-700",
  },
  rose: {
    text: "text-rose-700",
    bg: "bg-rose-700",
    lightBg: "bg-rose-50",
    border: "border-rose-700",
  },
  slate: {
    text: "text-slate-700",
    bg: "bg-slate-800",
    lightBg: "bg-slate-100",
    border: "border-slate-700",
  },
  orange: {
    text: "text-orange-700",
    bg: "bg-orange-700",
    lightBg: "bg-orange-50",
    border: "border-orange-700",
  },
};

function SimplePreview(props: SimplePreviewProps) {
  const accent =
    previewAccentClasses[
      props.accentColor
    ];

  switch (props.template) {
    case "modern":
      return (
        <ModernPreview
          {...props}
          accent={accent}
        />
      );

    case "professional":
      return (
        <ProfessionalPreview
          {...props}
          accent={accent}
        />
      );

    case "minimal":
      return (
        <MinimalPreview
          {...props}
          accent={accent}
        />
      );

    case "executive":
      return (
        <ExecutivePreview
          {...props}
          accent={accent}
        />
      );

    case "creative":
      return (
        <CreativePreview
          {...props}
          accent={accent}
        />
      );

    case "classic":
    default:
      return (
        <ClassicPreview
          {...props}
          accent={accent}
        />
      );
  }
}

type TemplatePreviewProps =
  SimplePreviewProps & {
    accent: AccentClasses;
  };

/* =========================================================
   CLASSIC PREVIEW
========================================================= */

function ClassicPreview({
  accent,
  ...props
}: TemplatePreviewProps) {
  return (
    <PreviewPaper>
      <header
        className={`border-b-2 pb-5 ${accent.border}`}
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {props.name}
        </h1>

        <p
          className={`mt-1 text-sm font-semibold ${accent.text}`}
        >
          {props.title ||
            "Professional Title"}
        </p>

        <PreviewContact
          {...props}
          accent={accent}
        />
      </header>

      <PreviewContent
        {...props}
        accent={accent}
      />
    </PreviewPaper>
  );
}

/* =========================================================
   MODERN PREVIEW
========================================================= */

function ModernPreview({
  accent,
  ...props
}: TemplatePreviewProps) {
  return (
    <PreviewPaper>
      <header
        className={`${accent.bg} -mx-6 -mt-8 px-6 py-8 text-white sm:-mx-10 sm:-mt-10 sm:px-10`}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          {props.name}
        </h1>

        <p className="mt-1 text-sm font-medium text-white/90">
          {props.title ||
            "Professional Title"}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">
          {props.email && (
            <span>{props.email}</span>
          )}
          {props.phone && (
            <span>{props.phone}</span>
          )}
          {props.location && (
            <span>{props.location}</span>
          )}
        </div>

        <PreviewLinks
          {...props}
          className="mt-2 text-white/90"
        />
      </header>

      <div className="pt-4">
        <PreviewContent
          {...props}
          accent={accent}
          coloredHeadings
        />
      </div>
    </PreviewPaper>
  );
}

/* =========================================================
   PROFESSIONAL PREVIEW
========================================================= */

function ProfessionalPreview({
  accent,
  ...props
}: TemplatePreviewProps) {
  return (
    <PreviewPaper>
      <header className="grid grid-cols-1 gap-5 border-b border-slate-300 pb-6 sm:grid-cols-[1fr_auto]">
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accent.text}`}
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
          {props.email && (
            <p>{props.email}</p>
          )}
          {props.phone && (
            <p>{props.phone}</p>
          )}
          {props.location && (
            <p>{props.location}</p>
          )}
        </div>
      </header>

      <PreviewLinks
        {...props}
        className={`mt-3 ${accent.text}`}
      />

      <PreviewContent
        {...props}
        accent={accent}
        coloredHeadings
      />
    </PreviewPaper>
  );
}

/* =========================================================
   MINIMAL PREVIEW
========================================================= */

function MinimalPreview({
  accent,
  ...props
}: TemplatePreviewProps) {
  return (
    <PreviewPaper>
      <header className="pb-8 text-center">
        <h1 className="text-3xl font-medium tracking-[0.05em] text-slate-950">
          {props.name}
        </h1>

        <p
          className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${accent.text}`}
        >
          {props.title ||
            "Professional Title"}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
          {props.email && (
            <span>{props.email}</span>
          )}
          {props.phone && (
            <span>{props.phone}</span>
          )}
          {props.location && (
            <span>{props.location}</span>
          )}
        </div>

        <PreviewLinks
          {...props}
          className={`mt-2 justify-center ${accent.text}`}
        />
      </header>

      <PreviewContent
        {...props}
        accent={accent}
        minimal
      />
    </PreviewPaper>
  );
}

/* =========================================================
   EXECUTIVE PREVIEW
========================================================= */

function ExecutivePreview({
  accent,
  ...props
}: TemplatePreviewProps) {
  return (
    <PreviewPaper>
      <header className="border-y border-slate-900 py-7 text-center">
        <h1 className="font-serif text-4xl font-semibold tracking-wide text-slate-950">
          {props.name}
        </h1>

        <p
          className={`mt-3 text-[11px] font-bold uppercase tracking-[0.25em] ${accent.text}`}
        >
          {props.title ||
            "Executive Profile"}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {props.email && (
            <span>{props.email}</span>
          )}
          {props.phone && (
            <span>{props.phone}</span>
          )}
          {props.location && (
            <span>{props.location}</span>
          )}
        </div>

        <PreviewLinks
          {...props}
          className={`mt-2 justify-center ${accent.text}`}
        />
      </header>

      <PreviewContent
        {...props}
        accent={accent}
        executive
      />
    </PreviewPaper>
  );
}

/* =========================================================
   CREATIVE PREVIEW
========================================================= */

function CreativePreview({
  accent,
  ...props
}: TemplatePreviewProps) {
  return (
    <PreviewPaper>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[160px_minmax(0,1fr)]">
        <aside
          className={`${accent.bg} rounded-sm px-4 py-6 text-white`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl font-bold">
            {props.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="mt-6 space-y-2 break-words text-[11px] leading-5 text-white/90">
            {props.email && (
              <p>{props.email}</p>
            )}
            {props.phone && (
              <p>{props.phone}</p>
            )}
            {props.location && (
              <p>{props.location}</p>
            )}
          </div>

          <PreviewLinks
            {...props}
            vertical
            className="mt-6 text-white/90"
          />

          {props.skills.length > 0 && (
            <div className="mt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                Skills
              </p>

              <div className="mt-3 space-y-2 text-xs">
                {props.skills.map(
                  (skill, index) => (
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

        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-slate-950">
            {props.name}
          </h1>

          <p
            className={`mt-1 text-sm font-semibold ${accent.text}`}
          >
            {props.title ||
              "Professional Title"}
          </p>

          <PreviewContent
            {...props}
            accent={accent}
            hideSkills
            creative
          />
        </div>
      </div>
    </PreviewPaper>
  );
}

/* =========================================================
   SHARED PREVIEW PAPER
========================================================= */

function PreviewPaper({
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
   CONTACT / LINKS
========================================================= */

function PreviewContact({
  accent,
  ...props
}: TemplatePreviewProps) {
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {props.email && (
          <span>{props.email}</span>
        )}
        {props.phone && (
          <span>{props.phone}</span>
        )}
        {props.location && (
          <span>{props.location}</span>
        )}
      </div>

      <PreviewLinks
        {...props}
        className={`mt-2 ${accent.text}`}
      />
    </>
  );
}

function PreviewLinks({
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  className = "",
  vertical = false,
}: SimplePreviewProps & {
  className?: string;
  vertical?: boolean;
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
      className={`text-xs font-medium ${
        vertical
          ? "space-y-2"
          : "flex flex-wrap gap-x-4 gap-y-1"
      } ${className}`}
    >
      {linkedinUrl && (
        <span className={
          vertical
            ? "block"
            : ""
        }>
          LinkedIn
        </span>
      )}

      {githubUrl && (
        <span className={
          vertical
            ? "block"
            : ""
        }>
          GitHub
        </span>
      )}

      {portfolioUrl && (
        <span className={
          vertical
            ? "block"
            : ""
        }>
          Portfolio
        </span>
      )}
    </div>
  );
}

/* =========================================================
   SHARED CONTENT
========================================================= */

function PreviewContent({
  summary,
  skills,
  experience,
  education,
  projects,
  accent,
  coloredHeadings = false,
  minimal = false,
  executive = false,
  creative = false,
  hideSkills = false,
}: TemplatePreviewProps & {
  coloredHeadings?: boolean;
  minimal?: boolean;
  executive?: boolean;
  creative?: boolean;
  hideSkills?: boolean;
}) {
  const headingClass =
    coloredHeadings ||
    creative
      ? accent.text
      : "text-slate-600";

  const spacing =
    minimal
      ? "py-7"
      : "py-5";

  return (
    <>
      {summary && (
        <PreviewSection
          title={
            creative
              ? "Profile"
              : "Professional Summary"
          }
          accentClass={
            headingClass
          }
          className={spacing}
          executive={executive}
          creative={creative}
          accentBg={accent.bg}
        >
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {summary}
          </p>
        </PreviewSection>
      )}

      {experience.length > 0 && (
        <PreviewSection
          title="Experience"
          accentClass={
            headingClass
          }
          className={spacing}
          executive={executive}
          creative={creative}
          accentBg={accent.bg}
        >
          <div className="space-y-5">
            {experience.map(
              (item, index) => (
                <div key={index}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
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
                        " – "}
                      {item.currently_working
                        ? "Present"
                        : item.end_date ||
                          ""}
                    </p>
                  </div>

                  {item.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {item.description}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </PreviewSection>
      )}

      {education.length > 0 && (
        <PreviewSection
          title="Education"
          accentClass={
            headingClass
          }
          className={spacing}
          executive={executive}
          creative={creative}
          accentBg={accent.bg}
        >
          <div className="space-y-4">
            {education.map(
              (item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.school}
                    </h3>

                    <p className="text-sm text-slate-600">
                      {item.degree || ""}
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
                      " – "}
                    {item.end_date || ""}
                  </p>
                </div>
              )
            )}
          </div>
        </PreviewSection>
      )}

      {projects.length > 0 && (
        <PreviewSection
          title="Projects"
          accentClass={
            headingClass
          }
          className={spacing}
          executive={executive}
          creative={creative}
          accentBg={accent.bg}
        >
          <div className="space-y-4">
            {projects.map(
              (item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.name}
                    </h3>

                    {item.url && (
                      <span
                        className={`text-xs font-medium ${accent.text}`}
                      >
                        Project link
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {item.description}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </PreviewSection>
      )}

      {!hideSkills &&
        skills.length > 0 && (
          <PreviewSection
            title="Skills"
            accentClass={
              headingClass
            }
            className={spacing}
            executive={executive}
            creative={creative}
            accentBg={accent.bg}
          >
            <div className="flex flex-wrap gap-2">
              {skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className={`${accent.lightBg} rounded px-2.5 py-1 text-xs font-medium ${accent.text}`}
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </PreviewSection>
        )}
    </>
  );
}

/* =========================================================
   PREVIEW SECTION
========================================================= */

function PreviewSection({
  title,
  accentClass,
  children,
  className = "py-5",
  executive = false,
  creative = false,
  accentBg = "bg-blue-700",
}: {
  title: string;
  accentClass: string;
  children: ReactNode;
  className?: string;
  executive?: boolean;
  creative?: boolean;
  accentBg?: string;
}) {
  return (
    <section
      className={`border-b border-slate-200 last:border-0 ${className}`}
    >
      <div
        className={
          creative
            ? "mb-3 flex items-center gap-2"
            : "mb-3"
        }
      >
        {creative && (
          <span
            className={`h-5 w-1 rounded-full ${accentBg}`}
          />
        )}

        <h2
          className={`text-xs font-bold uppercase ${
            executive
              ? "font-serif tracking-[0.2em]"
              : "tracking-[0.12em]"
          } ${accentClass}`}
        >
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   FORM COMPONENTS
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
  onChange:
    (
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
        className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />

    </div>
  );
}

export default EditResume;