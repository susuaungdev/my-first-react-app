import {
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/dashboard/Sidebar";
import {
  createResume,
  type ResumeAccentColor,
  type ResumeCustomSection,
  type ResumeDesignSettings,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeProject,
  type ResumeTemplate,
} from "../services/resumeService";

type TemplateCategory = "ATS" | "Modern" | "Creative" | "Executive";
type TemplateLayout = "classic" | "header" | "sidebar" | "split" | "minimal" | "serif";

type TemplateOption = {
  id: ResumeTemplate;
  name: string;
  description: string;
  category: TemplateCategory;
  layout: TemplateLayout;
};

const templateOptions: TemplateOption[] = [
  { id: "classic", name: "Classic", description: "Traditional and ATS-friendly", category: "ATS", layout: "classic" },
  { id: "professional", name: "Professional", description: "Structured corporate layout", category: "ATS", layout: "classic" },
  { id: "compact", name: "Compact", description: "Space-efficient for detailed CVs", category: "ATS", layout: "classic" },
  { id: "minimal", name: "Minimal", description: "Clean typography and whitespace", category: "Modern", layout: "minimal" },
  { id: "modern", name: "Modern", description: "Bold header with clean sections", category: "Modern", layout: "header" },
  { id: "contemporary", name: "Contemporary", description: "Fresh, polished visual hierarchy", category: "Modern", layout: "header" },
  { id: "sidebar", name: "Sidebar", description: "Designer two-column resume", category: "Modern", layout: "sidebar" },
  { id: "creative", name: "Creative", description: "Strong visual personality", category: "Creative", layout: "sidebar" },
  { id: "bold", name: "Bold", description: "High-impact creative layout", category: "Creative", layout: "split" },
  { id: "elegant", name: "Elegant", description: "Soft, refined and stylish", category: "Creative", layout: "split" },
  { id: "executive", name: "Executive", description: "Premium layout for senior roles", category: "Executive", layout: "serif" },
  { id: "serif", name: "Editorial", description: "Editorial serif presentation", category: "Executive", layout: "serif" },
];

const presetColors = [
  "#2563EB",
  "#0F766E",
  "#7C3AED",
  "#BE123C",
  "#0F172A",
  "#C2410C",
  "#0891B2",
  "#4F46E5",
  "#15803D",
  "#A21CAF",
  "#B45309",
  "#334155",
];

const fontOptions = [
  { name: "Inter", value: "Inter, Arial, sans-serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Garamond", value: "Garamond, Georgia, serif" },
  { name: "Times New Roman", value: '"Times New Roman", serif' },
  { name: "Trebuchet", value: '"Trebuchet MS", Arial, sans-serif' },
  { name: "Verdana", value: "Verdana, Arial, sans-serif" },
  { name: "Tahoma", value: "Tahoma, Arial, sans-serif" },
  { name: "Palatino", value: '"Palatino Linotype", Palatino, serif' },
  { name: "Courier", value: '"Courier New", monospace' },
];

const defaultDesignSettings: ResumeDesignSettings = {
  primary_color: "#2563EB",
  heading_color: "#0F172A",
  body_color: "#334155",
  background_color: "#FFFFFF",
  font_family: "Inter, Arial, sans-serif",
  base_font_size: 14,
  heading_scale: 1,
  line_height: 1.55,
  section_spacing: 22,
  photo_shape: "circle",
  hidden_sections: [],
};

const builtInSections = [
  { id: "summary", label: "Professional summary" },
  { id: "experience", label: "Work experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
] as const;

const initialSectionOrder = builtInSections.map((section) => section.id);

function CreateResume() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  let user: { name?: string; email?: string } | null = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>("modern");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "All">("All");
  const [selectedAccentColor, setSelectedAccentColor] = useState<ResumeAccentColor>("blue");
  const [designSettings, setDesignSettings] = useState<ResumeDesignSettings>(defaultDesignSettings);

  /* Keep the page simple for new users. Advanced controls stay hidden until requested. */
  const [showAdvancedDesign, setShowAdvancedDesign] = useState(false);

  /* On phones the preview is optional so the form has enough room. */
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const updateDesignSetting = <K extends keyof ResumeDesignSettings>(
    key: K,
    value: ResumeDesignSettings[K]
  ) => {
    setDesignSettings((current) => ({ ...current, [key]: value }));
  };

  const choosePresetColor = (color: string) => {
    updateDesignSetting("primary_color", color);
    const legacyMap: Record<string, ResumeAccentColor> = {
      "#2563EB": "blue",
      "#0F766E": "emerald",
      "#7C3AED": "purple",
      "#BE123C": "rose",
      "#0F172A": "slate",
      "#C2410C": "orange",
    };
    if (legacyMap[color]) setSelectedAccentColor(legacyMap[color]);
  };

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    const maxSize = 1.5 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError("Profile image must be 1.5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
        setPhotoError("");
      }
    };
    reader.onerror = () => setPhotoError("Could not read the selected image.");
    reader.readAsDataURL(file);
  };

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skills, setSkills] = useState("");

  const [experience, setExperience] = useState<ResumeExperience[]>([
    {
      company: "",
      job_title: "",
      location: "",
      start_date: "",
      end_date: "",
      currently_working: false,
      description: "",
    },
  ]);

  const [education, setEducation] = useState<ResumeEducation[]>([
    {
      school: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
    },
  ]);

  const [projects, setProjects] = useState<ResumeProject[]>([
    {
      name: "",
      description: "",
      url: "",
    },
  ]);

  const [customSections, setCustomSections] = useState<ResumeCustomSection[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>(initialSectionOrder);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  const [customSectionTitle, setCustomSectionTitle] = useState("");
  const [customSectionContent, setCustomSectionContent] = useState("");

  const makeSectionId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `custom-${crypto.randomUUID()}`;
    }
    return `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const addCustomSection = (presetTitle = "") => {
    const newSection: ResumeCustomSection = {
      id: makeSectionId(),
      title: presetTitle,
      content: "",
    };

    setCustomSections((current) => [...current, newSection]);
    setSectionOrder((current) => [...current, newSection.id]);
  };

  const addCustomInformation = () => {
    const cleanTitle = customSectionTitle.trim();
    const cleanContent = customSectionContent.trim();

    if (!cleanTitle) {
      toast.error("Please enter a custom section title.");
      return;
    }

    if (!cleanContent) {
      toast.error("Please enter the custom section information.");
      return;
    }

    const newSection: ResumeCustomSection = {
      id: makeSectionId(),
      title: cleanTitle,
      content: cleanContent,
    };

    setCustomSections((current) => [...current, newSection]);
    setSectionOrder((current) => [...current, newSection.id]);

    setCustomSectionTitle("");
    setCustomSectionContent("");

    toast.success("Custom information added.");
  };

  const updateCustomSection = (
    id: string,
    field: "title" | "content",
    value: string
  ) => {
    setCustomSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const removeCustomSection = (id: string) => {
    setCustomSections((current) => current.filter((section) => section.id !== id));
    setSectionOrder((current) => current.filter((sectionId) => sectionId !== id));
    setDesignSettings((current) => ({
      ...current,
      hidden_sections: current.hidden_sections.filter((sectionId) => sectionId !== id),
    }));
  };

  const toggleSectionVisibility = (id: string) => {
    setDesignSettings((current) => {
      const hidden = current.hidden_sections.includes(id);
      return {
        ...current,
        hidden_sections: hidden
          ? current.hidden_sections.filter((sectionId) => sectionId !== id)
          : [...current.hidden_sections, id],
      };
    });
  };

  const getSectionLabel = (id: string) => {
    const builtIn = builtInSections.find((section) => section.id === id);
    if (builtIn) return builtIn.label;
    return customSections.find((section) => section.id === id)?.title || "Custom section";
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedSection(id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    if (!draggedSection || draggedSection === targetId) {
      setDraggedSection(null);
      return;
    }

    setSectionOrder((current) => {
      const next = [...current];
      const from = next.indexOf(draggedSection);
      const to = next.indexOf(targetId);
      if (from < 0 || to < 0) return current;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

    setDraggedSection(null);
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setSectionOrder((current) => {
      const index = current.indexOf(id);
      if (index < 0) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const updateExperience = (
    index: number,
    field: keyof ResumeExperience,
    value: string | boolean
  ) => {
    setExperience((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addExperience = () => {
    setExperience((current) => [
      ...current,
      {
        company: "",
        job_title: "",
        location: "",
        start_date: "",
        end_date: "",
        currently_working: false,
        description: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperience((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateEducation = (
    index: number,
    field: keyof ResumeEducation,
    value: string
  ) => {
    setEducation((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addEducation = () => {
    setEducation((current) => [
      ...current,
      {
        school: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateProject = (
    index: number,
    field: keyof ResumeProject,
    value: string
  ) => {
    setProjects((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addProject = () => {
    setProjects((current) => [
      ...current,
      { name: "", description: "", url: "" },
    ]);
  };

  const removeProject = (index: number) => {
    setProjects((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      const message = "Resume title is required.";
      setError(message);
      toast.error(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      setError("");

      const cleanedExperience = experience.filter(
        (item) => item.company.trim() || item.job_title.trim()
      );
      const cleanedEducation = education.filter((item) => item.school.trim());
      const cleanedProjects = projects.filter((item) => item.name.trim());
      const cleanedCustomSections = customSections.filter(
        (section) => section.title.trim() || section.content.trim()
      );

      const validIds = new Set([
        ...initialSectionOrder,
        ...cleanedCustomSections.map((section) => section.id),
      ]);

      const cleanedSectionOrder = sectionOrder.filter((id) => validIds.has(id));

      await createResume({
        title: title.trim(),
        summary: summary.trim(),
        phone: phone.trim(),
        location: location.trim(),
        linkedin_url: linkedinUrl.trim(),
        github_url: githubUrl.trim(),
        portfolio_url: portfolioUrl.trim(),
        skills: skills.trim(),
        experience: cleanedExperience,
        education: cleanedEducation,
        projects: cleanedProjects,
        template: selectedTemplate,
        accent_color: selectedAccentColor,
        profile_image: profileImage,
        custom_sections: cleanedCustomSections,
        design_settings: designSettings,
        section_order: cleanedSectionOrder,
      });

      toast.success("Resume created successfully.");
      navigate("/resumes");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to create resume.";
      setError(message);
      toast.error(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const previewSkills = skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const previewExperience = experience.filter(
    (item) => item.company.trim() || item.job_title.trim()
  );
  const previewEducation = education.filter((item) => item.school.trim());
  const previewProjects = projects.filter((item) => item.name.trim());

  const visibleTemplates = useMemo(
    () =>
      selectedCategory === "All"
        ? templateOptions
        : templateOptions.filter((item) => item.category === selectedCategory),
    [selectedCategory]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className="text-lg font-bold text-blue-600">CareerFlow</h1>
        <div className="h-10 w-10" />
      </header>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="min-w-0 lg:ml-64">
        <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">Resume Builder</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create your resume
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Add your information first, choose a style, then arrange the sections. You can
                see every change in the live preview.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setMobilePreviewOpen((current) => !current)}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 2xl:hidden"
              >
                {mobilePreviewOpen ? "Hide preview" : "Preview resume"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/resumes")}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <GuideCard number="1" title="Add your details" text="Fill in only the sections you need." />
            <GuideCard number="2" title="Choose a style" text="Pick a template, color, and font." />
            <GuideCard number="3" title="Arrange & save" text="Move sections, preview, then create." />
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(500px,0.9fr)]">
            <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
              <StepHeader
                number="1"
                title="Add your information"
                description="Start with the basics. Leave optional sections empty if you do not need them."
              />

              <Section
                title="About you"
                description="Give this resume a name and write a short professional introduction."
              >
                <div className="space-y-4">
                  <InputField
                    label="Resume title"
                    value={title}
                    onChange={setTitle}
                    placeholder="Frontend Developer Resume"
                  />
                  <div>
                    <Label>Professional summary</Label>
                    <textarea
                      rows={5}
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                      placeholder="Write a short professional summary..."
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </Section>

              <Section
                title="Contact information"
                description="Add the contact details employers should use."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="Phone" value={phone} onChange={setPhone} placeholder="+95 9..." />
                  <InputField
                    label="Location"
                    value={location}
                    onChange={setLocation}
                    placeholder="Yangon, Myanmar"
                  />
                </div>
              </Section>

              <Section
                title="Professional links"
                description="Optional. Add links that help employers learn more about your work."
              >
                <div className="space-y-4">
                  <InputField
                    label="LinkedIn"
                    value={linkedinUrl}
                    onChange={setLinkedinUrl}
                    placeholder="https://linkedin.com/in/username"
                  />
                  <InputField
                    label="GitHub"
                    value={githubUrl}
                    onChange={setGithubUrl}
                    placeholder="https://github.com/username"
                  />
                  <InputField
                    label="Portfolio"
                    value={portfolioUrl}
                    onChange={setPortfolioUrl}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </Section>

              <Section
                title="Personal photo"
                description="Optional. Add a professional photo if the resume style or job market calls for one."
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl text-slate-400">◯</span>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Photo
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Upload photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                    {profileImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileImage(null);
                          setPhotoError("");
                        }}
                        className="ml-3 text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                    {photoError && (
                      <p className="mt-2 text-xs font-medium text-red-600">{photoError}</p>
                    )}
                  </div>
                </div>
              </Section>

              <StepHeader
                number="2"
                title="Add your experience"
                description="Add only what helps tell your professional story."
              />

              <Section
                title="Work experience"
                description="Add your jobs, internships, freelance work, or other relevant experience."
              >
                <div className="space-y-5">
                  {experience.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Experience {index + 1}
                        </h3>
                        {experience.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-xs font-semibold text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField
                          label="Company"
                          value={item.company}
                          onChange={(value) => updateExperience(index, "company", value)}
                          placeholder="Company name"
                        />
                        <InputField
                          label="Job title"
                          value={item.job_title}
                          onChange={(value) => updateExperience(index, "job_title", value)}
                          placeholder="Frontend Developer"
                        />
                        <InputField
                          label="Location"
                          value={item.location || ""}
                          onChange={(value) => updateExperience(index, "location", value)}
                          placeholder="Yangon"
                        />
                        <div />
                        <InputField
                          label="Start date"
                          value={item.start_date || ""}
                          onChange={(value) => updateExperience(index, "start_date", value)}
                          placeholder="2025-01"
                        />
                        <InputField
                          label="End date"
                          value={item.end_date || ""}
                          onChange={(value) => updateExperience(index, "end_date", value)}
                          placeholder="2026-01"
                        />
                        <label className="flex items-center gap-2 sm:col-span-2">
                          <input
                            type="checkbox"
                            checked={item.currently_working || false}
                            onChange={(event) =>
                              updateExperience(index, "currently_working", event.target.checked)
                            }
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                          />
                          <span className="text-sm text-slate-600">I currently work here</span>
                        </label>
                        <div className="sm:col-span-2">
                          <Label>Description</Label>
                          <textarea
                            rows={4}
                            value={item.description || ""}
                            onChange={(event) =>
                              updateExperience(index, "description", event.target.value)
                            }
                            placeholder="Describe responsibilities and achievements..."
                            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addExperience}
                    className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    + Add experience
                  </button>
                </div>
              </Section>

              <Section title="Education" description="Add your school, degree, course, or other qualification.">
                <div className="space-y-5">
                  {education.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Education {index + 1}
                        </h3>
                        {education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="text-xs font-semibold text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField
                          label="School"
                          value={item.school}
                          onChange={(value) => updateEducation(index, "school", value)}
                          placeholder="University name"
                        />
                        <InputField
                          label="Degree"
                          value={item.degree || ""}
                          onChange={(value) => updateEducation(index, "degree", value)}
                          placeholder="Bachelor's degree"
                        />
                        <InputField
                          label="Field of study"
                          value={item.field_of_study || ""}
                          onChange={(value) => updateEducation(index, "field_of_study", value)}
                          placeholder="Computer Science"
                        />
                        <div />
                        <InputField
                          label="Start date"
                          value={item.start_date || ""}
                          onChange={(value) => updateEducation(index, "start_date", value)}
                          placeholder="2021"
                        />
                        <InputField
                          label="End date"
                          value={item.end_date || ""}
                          onChange={(value) => updateEducation(index, "end_date", value)}
                          placeholder="2025"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEducation}
                    className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    + Add education
                  </button>
                </div>
              </Section>

              <Section title="Skills" description="Add the skills that are most relevant to the jobs you want.">
                <Label>Skills</Label>
                <textarea
                  rows={3}
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                  placeholder="React, TypeScript, Node.js, MySQL..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-2 text-xs text-slate-400">Separate skills with commas.</p>
              </Section>

              <Section title="Projects" description="Optional. Add projects that show your skills and experience.">
                <div className="space-y-5">
                  {projects.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-800">Project {index + 1}</h3>
                        {projects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProject(index)}
                            className="text-xs font-semibold text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <InputField
                          label="Project name"
                          value={item.name}
                          onChange={(value) => updateProject(index, "name", value)}
                          placeholder="CareerFlow"
                        />
                        <InputField
                          label="Project URL"
                          value={item.url || ""}
                          onChange={(value) => updateProject(index, "url", value)}
                          placeholder="https://github.com/..."
                        />
                        <div>
                          <Label>Description</Label>
                          <textarea
                            rows={4}
                            value={item.description || ""}
                            onChange={(event) =>
                              updateProject(index, "description", event.target.value)
                            }
                            placeholder="Describe the project..."
                            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addProject}
                    className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    + Add project
                  </button>
                </div>
              </Section>

              <Section
                title="Add extra information"
                description="Optional. Add languages, certificates, awards, hobbies, references, or anything else you want."
              >

                <div className="mb-5">
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    Quick add
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Languages",
                      "Certifications",
                      "Awards",
                      "Volunteer Work",
                      "Publications",
                      "References",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addCustomSection(preset)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">

                  <div className="mb-4">

                    <h3 className="text-sm font-bold text-slate-900">
                      Add custom information
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Enter a section name and the information you want displayed in your resume.
                    </p>

                  </div>

                  <div className="space-y-4">

                    <InputField
                      label="Section title"
                      value={customSectionTitle}
                      onChange={setCustomSectionTitle}
                      placeholder="Example: Languages, Awards, Hobbies, Certifications"
                    />

                    <div>

                      <Label>Information</Label>

                      <textarea
                        rows={5}
                        value={customSectionContent}
                        onChange={(event) =>
                          setCustomSectionContent(event.target.value)
                        }
                        placeholder={"Example:\nEnglish — Fluent\nJapanese — Intermediate\nMyanmar — Native"}
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <p className="text-xs text-slate-500">
                        After adding it, you can edit, hide, remove, or drag it to a new position.
                      </p>

                      <button
                        type="button"
                        onClick={addCustomInformation}
                        className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        + Add to resume
                      </button>

                    </div>

                  </div>

                </div>

                {customSections.length > 0 && (
                  <div className="mt-5 space-y-4">

                    <div className="flex items-center justify-between gap-3">

                      <h3 className="text-sm font-bold text-slate-900">
                        Added custom sections
                      </h3>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        {customSections.length}
                      </span>

                    </div>

                    {customSections.map((section) => (
                      <div
                        key={section.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >

                        <div className="flex items-center justify-between gap-3">

                          <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
                            {section.title || "Custom section"}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeCustomSection(section.id)}
                            className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>

                        </div>

                        <div className="mt-4 space-y-4">

                          <InputField
                            label="Section title"
                            value={section.title}
                            onChange={(value) =>
                              updateCustomSection(section.id, "title", value)
                            }
                            placeholder="Languages, Awards, Certifications..."
                          />

                          <div>

                            <Label>Information</Label>

                            <textarea
                              rows={5}
                              value={section.content}
                              onChange={(event) =>
                                updateCustomSection(
                                  section.id,
                                  "content",
                                  event.target.value
                                )
                              }
                              placeholder="Add any information you want to show..."
                              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />

                          </div>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </Section>

              <StepHeader
                number="3"
                title="Choose your style"
                description="Pick a template and color first. Advanced settings are optional."
              />

              <Section
                title="Choose a template"
                description="Pick the look you like. You can change it anytime without losing your information."
              >
                <div className="mb-5 flex flex-wrap gap-2">
                  {(["All", "ATS", "Modern", "Creative", "Executive"] as const).map(
                    (category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          selectedCategory === category
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {category}
                      </button>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                  {visibleTemplates.map((template) => {
                    const active = selectedTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`overflow-hidden rounded-xl border-2 bg-white text-left transition ${
                          active
                            ? "border-blue-600 ring-4 ring-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <TemplateThumbnail
                          layout={template.layout}
                          primaryColor={designSettings.primary_color}
                        />
                        <div className="border-t border-slate-100 px-3 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`truncate text-sm font-semibold ${
                                active ? "text-blue-700" : "text-slate-800"
                              }`}
                            >
                              {template.name}
                            </p>
                            {active && (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-400">
                            {template.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section
                title="Style your resume"
                description="Start with a color and font. Open advanced options only if you want more control."
              >
                <div className="space-y-6">

                  <div>
                    <Label>Choose a color</Label>
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => choosePresetColor(color)}
                          className={`h-9 w-9 rounded-full border-2 transition ${
                            designSettings.primary_color.toUpperCase() === color
                              ? "border-slate-900 ring-4 ring-slate-100"
                              : "border-white ring-1 ring-slate-200 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Choose ${color}`}
                        />
                      ))}

                      <label className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                        <span
                          className="h-4 w-4 rounded-full border border-slate-200"
                          style={{ backgroundColor: designSettings.primary_color }}
                        />
                        Custom
                        <input
                          type="color"
                          value={designSettings.primary_color}
                          onChange={(event) =>
                            updateDesignSetting(
                              "primary_color",
                              event.target.value.toUpperCase()
                            )
                          }
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Font</Label>
                      <select
                        value={designSettings.font_family}
                        onChange={(event) =>
                          updateDesignSetting("font_family", event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.name} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Photo shape</Label>
                      <select
                        value={designSettings.photo_shape}
                        onChange={(event) =>
                          updateDesignSetting(
                            "photo_shape",
                            event.target.value as ResumeDesignSettings["photo_shape"]
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="circle">Circle</option>
                        <option value="rounded">Rounded square</option>
                        <option value="square">Square</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvancedDesign((current) => !current)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <span>Advanced design options</span>
                    <span className="text-slate-400">
                      {showAdvancedDesign ? "−" : "+"}
                    </span>
                  </button>

                  {showAdvancedDesign && (
                    <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ColorField
                          label="Heading color"
                          value={designSettings.heading_color}
                          onChange={(value) =>
                            updateDesignSetting("heading_color", value)
                          }
                        />
                        <ColorField
                          label="Text color"
                          value={designSettings.body_color}
                          onChange={(value) =>
                            updateDesignSetting("body_color", value)
                          }
                        />
                        <ColorField
                          label="Page background"
                          value={designSettings.background_color}
                          onChange={(value) =>
                            updateDesignSetting("background_color", value)
                          }
                        />
                        <ColorField
                          label="Primary color"
                          value={designSettings.primary_color}
                          onChange={(value) =>
                            updateDesignSetting("primary_color", value)
                          }
                        />
                      </div>

                      <SliderField
                        label="Text size"
                        value={designSettings.base_font_size}
                        min={11}
                        max={18}
                        step={1}
                        suffix="px"
                        onChange={(value) =>
                          updateDesignSetting("base_font_size", value)
                        }
                      />

                      <SliderField
                        label="Heading size"
                        value={designSettings.heading_scale}
                        min={0.8}
                        max={1.5}
                        step={0.05}
                        suffix="×"
                        onChange={(value) =>
                          updateDesignSetting("heading_scale", value)
                        }
                      />

                      <SliderField
                        label="Line spacing"
                        value={designSettings.line_height}
                        min={1.2}
                        max={2}
                        step={0.05}
                        suffix=""
                        onChange={(value) =>
                          updateDesignSetting("line_height", value)
                        }
                      />

                      <SliderField
                        label="Space between sections"
                        value={designSettings.section_spacing}
                        min={10}
                        max={40}
                        step={1}
                        suffix="px"
                        onChange={(value) =>
                          updateDesignSetting("section_spacing", value)
                        }
                      />

                    </div>
                  )}

                </div>
              </Section>

              <StepHeader
                number="4"
                title="Arrange and finish"
                description="Put the most important sections first, then save your resume."
              />

              <Section
                title="Arrange your sections"
                description="Use the arrows on phones, or drag sections on a computer. Hide anything you do not want to show."
              >
                <div className="space-y-2">

                  {sectionOrder.map((id, index) => {
                    const hidden = designSettings.hidden_sections.includes(id);
                    const isCustom = id.startsWith("custom-");

                    return (
                      <div
                        key={id}
                        draggable
                        onDragStart={(event) => handleDragStart(event, id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(event, id)}
                        className={`rounded-xl border p-3 transition ${
                          draggedSection === id
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <span
                            className="hidden cursor-grab text-lg text-slate-400 sm:inline"
                            title="Drag to move"
                          >
                            ≡
                          </span>

                          <span
                            className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                              hidden ? "text-slate-400 line-through" : "text-slate-700"
                            }`}
                          >
                            {getSectionLabel(id)}
                          </span>

                          <div className="flex shrink-0 items-center gap-1">

                            <button
                              type="button"
                              onClick={() => moveSection(id, "up")}
                              disabled={index === 0}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Move ${getSectionLabel(id)} up`}
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              onClick={() => moveSection(id, "down")}
                              disabled={index === sectionOrder.length - 1}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Move ${getSectionLabel(id)} down`}
                            >
                              ↓
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleSectionVisibility(id)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                              {hidden ? "Show" : "Hide"}
                            </button>

                          </div>

                        </div>

                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => removeCustomSection(id)}
                            className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700"
                          >
                            Remove custom section
                          </button>
                        )}

                      </div>
                    );
                  })}

                </div>
              </Section>

              <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/resumes")}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Creating resume..." : "Create resume"}
                </button>
              </div>
            </form>

            <aside
              className={`min-w-0 ${
                mobilePreviewOpen ? "order-first block" : "hidden"
              } 2xl:order-none 2xl:block`}
            >
              <div className="2xl:sticky 2xl:top-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Resume preview</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {templateOptions.find((item) => item.id === selectedTemplate)?.name} · custom design
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
                    Live
                  </span>
                </div>

                <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-sm sm:p-5">
                  <ResumePreview
                    template={selectedTemplate}
                    designSettings={designSettings}
                    profileImage={profileImage}
                    name={user?.name || "Your Name"}
                    email={user?.email || ""}
                    title={title}
                    summary={summary}
                    phone={phone}
                    location={location}
                    linkedinUrl={linkedinUrl}
                    githubUrl={githubUrl}
                    portfolioUrl={portfolioUrl}
                    skills={previewSkills}
                    experience={previewExperience}
                    education={previewEducation}
                    projects={previewProjects}
                    customSections={customSections}
                    sectionOrder={sectionOrder}
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

type ResumePreviewProps = {
  template: ResumeTemplate;
  designSettings: ResumeDesignSettings;
  profileImage: string | null;
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
  customSections: ResumeCustomSection[];
  sectionOrder: string[];
};

type TemplateProps = Omit<ResumePreviewProps, "template">;

function ResumePreview({ template, ...props }: ResumePreviewProps) {
  const option = templateOptions.find((item) => item.id === template) || templateOptions[0];

  switch (option.layout) {
    case "header":
      return <HeaderTemplate {...props} />;
    case "sidebar":
      return <SidebarTemplate {...props} />;
    case "split":
      return <SplitTemplate {...props} />;
    case "minimal":
      return <MinimalTemplate {...props} />;
    case "serif":
      return <SerifTemplate {...props} />;
    default:
      return <ClassicTemplate {...props} compact={template === "compact"} />;
  }
}

function ResumePhoto({
  src,
  shape,
  className = "",
}: {
  src: string | null;
  shape: ResumeDesignSettings["photo_shape"];
  className?: string;
}) {
  if (!src) return null;

  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
      ? "rounded-2xl"
      : "rounded-none";

  return <img src={src} alt="Profile" className={`object-cover ${shapeClass} ${className}`} />;
}

function ResumePaper({
  children,
  designSettings,
  compact = false,
}: {
  children: ReactNode;
  designSettings: ResumeDesignSettings;
  compact?: boolean;
}) {
  return (
    <div
      className={`mx-auto min-h-[900px] w-full max-w-[760px] shadow-sm ${
        compact ? "px-6 py-7 sm:px-8 sm:py-8" : "px-6 py-8 sm:px-10 sm:py-10"
      }`}
      style={{
        backgroundColor: designSettings.background_color,
        color: designSettings.body_color,
        fontFamily: designSettings.font_family,
        fontSize: `${designSettings.base_font_size}px`,
        lineHeight: designSettings.line_height,
      }}
    >
      {children}
    </div>
  );
}

function ClassicTemplate({ compact = false, ...props }: TemplateProps & { compact?: boolean }) {
  return (
    <ResumePaper designSettings={props.designSettings} compact={compact}>
      <div
        className="flex flex-col items-start gap-4 border-b-2 pb-5 sm:flex-row sm:items-center sm:gap-5"
        style={{ borderColor: props.designSettings.primary_color }}
      >
        <ResumePhoto
          src={props.profileImage}
          shape={props.designSettings.photo_shape}
          className="h-20 w-20 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h1
            className="font-bold tracking-tight"
            style={{
              color: props.designSettings.heading_color,
              fontSize: `${Math.round(30 * props.designSettings.heading_scale)}px`,
            }}
          >
            {props.name}
          </h1>
          <p className="mt-1 font-semibold" style={{ color: props.designSettings.primary_color }}>
            {props.title || "Professional Title"}
          </p>
          <ContactLine {...props} />
        </div>
      </div>
      <OrderedSections {...props} />
    </ResumePaper>
  );
}

function HeaderTemplate(props: TemplateProps) {
  return (
    <ResumePaper designSettings={props.designSettings}>
      <div
        className="-mx-6 -mt-8 px-6 py-7 text-white sm:-mx-10 sm:-mt-10 sm:px-10"
        style={{ backgroundColor: props.designSettings.primary_color }}
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <ResumePhoto
            src={props.profileImage}
            shape={props.designSettings.photo_shape}
            className="h-24 w-24 shrink-0 border-4 border-white/30"
          />
          <div className="min-w-0">
            <h1
              className="font-bold tracking-tight"
              style={{ fontSize: `${Math.round(30 * props.designSettings.heading_scale)}px` }}
            >
              {props.name}
            </h1>
            <p className="mt-1 font-medium text-white/90">{props.title || "Professional Title"}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">
              {props.email && <span>{props.email}</span>}
              {props.phone && <span>{props.phone}</span>}
              {props.location && <span>{props.location}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-5">
        <OrderedSections {...props} />
      </div>
    </ResumePaper>
  );
}

function SidebarTemplate(props: TemplateProps) {
  return (
    <ResumePaper designSettings={props.designSettings}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[160px_1fr] sm:gap-7 lg:grid-cols-[185px_1fr]">
        <aside
          className="-mx-6 -mt-8 px-5 py-7 text-white sm:-ml-10 sm:-mr-0 sm:-my-10 sm:min-h-[900px] sm:px-5 sm:py-8"
          style={{ backgroundColor: props.designSettings.primary_color }}
        >
          <ResumePhoto
            src={props.profileImage}
            shape={props.designSettings.photo_shape}
            className="mx-auto h-28 w-28 border-4 border-white/25"
          />
          {!props.profileImage && (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-2xl font-bold">
              {props.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="mt-7 space-y-2 break-words text-[11px] text-white/90">
            {props.email && <p>{props.email}</p>}
            {props.phone && <p>{props.phone}</p>}
            {props.location && <p>{props.location}</p>}
          </div>
          {(props.linkedinUrl || props.githubUrl || props.portfolioUrl) && (
            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Links</p>
              <div className="mt-3 space-y-2 text-[11px] text-white/90">
                {props.linkedinUrl && <p>LinkedIn</p>}
                {props.githubUrl && <p>GitHub</p>}
                {props.portfolioUrl && <p>Portfolio</p>}
              </div>
            </div>
          )}
        </aside>
        <main>
          <h1
            className="font-bold"
            style={{
              color: props.designSettings.heading_color,
              fontSize: `${Math.round(30 * props.designSettings.heading_scale)}px`,
            }}
          >
            {props.name}
          </h1>
          <p className="mt-1 font-semibold" style={{ color: props.designSettings.primary_color }}>
            {props.title || "Professional Title"}
          </p>
          <OrderedSections {...props} />
        </main>
      </div>
    </ResumePaper>
  );
}

function SplitTemplate(props: TemplateProps) {
  return (
    <ResumePaper designSettings={props.designSettings}>
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: `${props.designSettings.primary_color}12` }}
      >
        <div className="flex items-center gap-5">
          <ResumePhoto
            src={props.profileImage}
            shape={props.designSettings.photo_shape}
            className="h-24 w-24 shrink-0"
          />
          <div>
            <h1
              className="font-bold"
              style={{
                color: props.designSettings.heading_color,
                fontSize: `${Math.round(30 * props.designSettings.heading_scale)}px`,
              }}
            >
              {props.name}
            </h1>
            <p className="mt-1 font-semibold" style={{ color: props.designSettings.primary_color }}>
              {props.title || "Professional Title"}
            </p>
            <p className="mt-3 text-xs opacity-70">
              {[props.email, props.phone, props.location].filter(Boolean).join("  •  ")}
            </p>
          </div>
        </div>
      </div>
      <OrderedSections {...props} />
    </ResumePaper>
  );
}

function MinimalTemplate(props: TemplateProps) {
  return (
    <ResumePaper designSettings={props.designSettings}>
      <div className="pb-7 text-center">
        <ResumePhoto
          src={props.profileImage}
          shape={props.designSettings.photo_shape}
          className="mx-auto mb-5 h-24 w-24"
        />
        <h1
          className="font-medium tracking-[0.04em]"
          style={{
            color: props.designSettings.heading_color,
            fontSize: `${Math.round(30 * props.designSettings.heading_scale)}px`,
          }}
        >
          {props.name}
        </h1>
        <p
          className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: props.designSettings.primary_color }}
        >
          {props.title || "Professional Title"}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs opacity-60">
          {props.email && <span>{props.email}</span>}
          {props.phone && <span>{props.phone}</span>}
          {props.location && <span>{props.location}</span>}
        </div>
      </div>
      <OrderedSections {...props} />
    </ResumePaper>
  );
}

function SerifTemplate(props: TemplateProps) {
  return (
    <ResumePaper designSettings={props.designSettings}>
      <div
        className="border-y py-6"
        style={{ borderColor: props.designSettings.heading_color }}
      >
        <div className="flex items-center gap-5">
          <ResumePhoto
            src={props.profileImage}
            shape={props.designSettings.photo_shape}
            className="h-24 w-24 shrink-0"
          />
          <div className="flex-1 text-center">
            <h1
              className="font-serif font-semibold tracking-wide"
              style={{
                color: props.designSettings.heading_color,
                fontSize: `${Math.round(32 * props.designSettings.heading_scale)}px`,
              }}
            >
              {props.name}
            </h1>
            <p
              className="mt-2 text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: props.designSettings.primary_color }}
            >
              {props.title || "Executive Profile"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs opacity-65">
              {props.email && <span>{props.email}</span>}
              {props.phone && <span>{props.phone}</span>}
              {props.location && <span>{props.location}</span>}
            </div>
          </div>
        </div>
      </div>
      <OrderedSections {...props} />
    </ResumePaper>
  );
}

function ContactLine(props: TemplateProps) {
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-65">
        {props.phone && <span>{props.phone}</span>}
        {props.location && <span>{props.location}</span>}
        {props.email && <span>{props.email}</span>}
      </div>
      <div
        className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs"
        style={{ color: props.designSettings.primary_color }}
      >
        {props.linkedinUrl && <span>LinkedIn</span>}
        {props.githubUrl && <span>GitHub</span>}
        {props.portfolioUrl && <span>Portfolio</span>}
      </div>
    </>
  );
}

function OrderedSections(props: TemplateProps) {
  return (
    <div>
      {props.sectionOrder.map((id) => {
        if (props.designSettings.hidden_sections.includes(id)) return null;

        switch (id) {
          case "summary":
            if (!props.summary) return null;
            return (
              <ResumeSection key={id} title="Professional Summary" settings={props.designSettings}>
                <p className="whitespace-pre-wrap">{props.summary}</p>
              </ResumeSection>
            );

          case "experience":
            if (props.experience.length === 0) return null;
            return (
              <ResumeSection key={id} title="Experience" settings={props.designSettings}>
                <div className="space-y-5">
                  {props.experience.map((item, index) => (
                    <div key={index}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3
                            className="font-bold"
                            style={{ color: props.designSettings.heading_color }}
                          >
                            {item.job_title || "Job Title"}
                          </h3>
                          <p className="font-medium opacity-80">
                            {item.company || "Company"}
                            {item.location ? ` · ${item.location}` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs opacity-60">
                          {item.start_date || ""}
                          {(item.start_date || item.end_date || item.currently_working) && " — "}
                          {item.currently_working ? "Present" : item.end_date || ""}
                        </p>
                      </div>
                      {item.description && (
                        <p className="mt-2 whitespace-pre-wrap">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </ResumeSection>
            );

          case "education":
            if (props.education.length === 0) return null;
            return (
              <ResumeSection key={id} title="Education" settings={props.designSettings}>
                <div className="space-y-4">
                  {props.education.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <h3
                          className="font-bold"
                          style={{ color: props.designSettings.heading_color }}
                        >
                          {item.school}
                        </h3>
                        <p className="opacity-80">
                          {[item.degree, item.field_of_study].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs opacity-60">
                        {[item.start_date, item.end_date].filter(Boolean).join(" — ")}
                      </p>
                    </div>
                  ))}
                </div>
              </ResumeSection>
            );

          case "skills":
            if (props.skills.length === 0) return null;
            return (
              <ResumeSection key={id} title="Skills" settings={props.designSettings}>
                <div className="flex flex-wrap gap-2">
                  {props.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-md px-2.5 py-1 text-xs font-medium"
                      style={{
                        color: props.designSettings.primary_color,
                        backgroundColor: `${props.designSettings.primary_color}12`,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </ResumeSection>
            );

          case "projects":
            if (props.projects.length === 0) return null;
            return (
              <ResumeSection key={id} title="Projects" settings={props.designSettings}>
                <div className="space-y-4">
                  {props.projects.map((item, index) => (
                    <div key={index}>
                      <h3
                        className="font-bold"
                        style={{ color: props.designSettings.heading_color }}
                      >
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="mt-1 whitespace-pre-wrap">{item.description}</p>
                      )}
                      {item.url && (
                        <p
                          className="mt-1 break-all text-xs"
                          style={{ color: props.designSettings.primary_color }}
                        >
                          {item.url}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ResumeSection>
            );

          default: {
            const custom = props.customSections.find((section) => section.id === id);
            if (!custom || (!custom.title.trim() && !custom.content.trim())) return null;
            return (
              <ResumeSection
                key={id}
                title={custom.title || "Additional Information"}
                settings={props.designSettings}
              >
                <p className="whitespace-pre-wrap">{custom.content}</p>
              </ResumeSection>
            );
          }
        }
      })}
    </div>
  );
}

function ResumeSection({
  title,
  settings,
  children,
}: {
  title: string;
  settings: ResumeDesignSettings;
  children: ReactNode;
}) {
  return (
    <section
      className="border-b border-slate-200 last:border-b-0"
      style={{
        paddingTop: `${settings.section_spacing}px`,
        paddingBottom: `${settings.section_spacing}px`,
      }}
    >
      <h2
        className="mb-4 font-bold uppercase tracking-[0.14em]"
        style={{
          color: settings.primary_color,
          fontSize: `${Math.max(10, Math.round(11 * settings.heading_scale))}px`,
        }}
      >
        {title}
      </h2>
      <div style={{ color: settings.body_color }}>{children}</div>
    </section>
  );
}

function TemplateThumbnail({
  layout,
  primaryColor,
}: {
  layout: TemplateLayout;
  primaryColor: string;
}) {
  if (layout === "sidebar") {
    return (
      <div className="h-28 bg-slate-100 p-2">
        <div className="flex h-full overflow-hidden rounded-sm bg-white">
          <div className="w-1/3 p-2" style={{ backgroundColor: primaryColor }}>
            <div className="mx-auto h-5 w-5 rounded-full bg-white/35" />
            <MiniLines light />
          </div>
          <div className="flex-1 p-2">
            <div className="h-2 w-2/3 rounded bg-slate-800" />
            <div className="mt-1 h-1 w-1/2 rounded" style={{ backgroundColor: primaryColor }} />
            <MiniLines />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "header") {
    return (
      <div className="h-28 bg-slate-100 p-2">
        <div className="h-full overflow-hidden rounded-sm bg-white">
          <div className="h-9 px-2 py-2" style={{ backgroundColor: primaryColor }}>
            <div className="h-2 w-1/2 rounded bg-white/90" />
            <div className="mt-1 h-1 w-1/3 rounded bg-white/55" />
          </div>
          <div className="px-2">
            <MiniLines />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "serif") {
    return (
      <div className="h-28 bg-slate-100 p-2">
        <div className="h-full rounded-sm bg-white p-2">
          <div className="border-y border-slate-500 py-2 text-center">
            <div className="mx-auto h-2 w-20 rounded bg-slate-800" />
            <div className="mx-auto mt-1 h-1 w-12 rounded" style={{ backgroundColor: primaryColor }} />
          </div>
          <MiniLines />
        </div>
      </div>
    );
  }

  if (layout === "split") {
    return (
      <div className="h-28 bg-slate-100 p-2">
        <div className="h-full rounded-sm bg-white p-2">
          <div className="rounded p-2" style={{ backgroundColor: `${primaryColor}15` }}>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <div>
                <div className="h-2 w-16 rounded bg-slate-800" />
                <div className="mt-1 h-1 w-10 rounded" style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
          </div>
          <MiniLines />
        </div>
      </div>
    );
  }

  if (layout === "minimal") {
    return (
      <div className="h-28 bg-slate-100 p-2">
        <div className="h-full rounded-sm bg-white p-3 text-center">
          <div className="mx-auto h-2 w-16 rounded bg-slate-700" />
          <div className="mx-auto mt-1 h-1 w-10 rounded" style={{ backgroundColor: primaryColor }} />
          <MiniLines />
        </div>
      </div>
    );
  }

  return (
    <div className="h-28 bg-slate-100 p-2">
      <div className="h-full rounded-sm bg-white p-2">
        <div className="h-2 w-2/3 rounded bg-slate-800" />
        <div className="mt-1 h-1 w-1/2 rounded" style={{ backgroundColor: primaryColor }} />
        <div className="mt-2 h-px" style={{ backgroundColor: primaryColor }} />
        <MiniLines />
      </div>
    </div>
  );
}

function MiniLines({ light = false }: { light?: boolean }) {
  return (
    <div className="mt-3 space-y-1">
      <div className={`h-1 w-full rounded ${light ? "bg-white/30" : "bg-slate-200"}`} />
      <div className={`h-1 w-5/6 rounded ${light ? "bg-white/25" : "bg-slate-200"}`} />
      <div className={`h-1 w-4/6 rounded ${light ? "bg-white/20" : "bg-slate-200"}`} />
    </div>
  );
}

function GuideCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function StepHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 pt-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-semibold text-slate-700">{children}</label>;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(next)) onChange(next.toUpperCase());
          }}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-slate-700 outline-none"
        />
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-semibold text-slate-500">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </div>
  );
}

export default CreateResume;