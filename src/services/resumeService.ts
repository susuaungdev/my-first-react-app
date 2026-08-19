import {
  apiRequest,
} from "./api";

/* =========================================================
   TEMPLATE TYPES
========================================================= */

export type ResumeTemplate =
  | "classic"
  | "modern"
  | "professional"
  | "minimal"
  | "executive"
  | "creative"
  | "elegant"
  | "bold"
  | "sidebar"
  | "compact"
  | "serif"
  | "contemporary";

/* =========================================================
   LEGACY ACCENT COLORS
========================================================= */

export type ResumeAccentColor =
  | "blue"
  | "emerald"
  | "purple"
  | "rose"
  | "slate"
  | "orange";

/* =========================================================
   EDITOR MODE
========================================================= */

export type ResumeEditorMode =
  | "builder"
  | "studio";

/* =========================================================
   EXPERIENCE
========================================================= */

export type ResumeExperience = {
  company: string;

  job_title: string;

  location?: string;

  start_date?: string;

  end_date?: string;

  currently_working?: boolean;

  description?: string;
};

/* =========================================================
   EDUCATION
========================================================= */

export type ResumeEducation = {
  school: string;

  degree?: string;

  field_of_study?: string;

  start_date?: string;

  end_date?: string;
};

/* =========================================================
   PROJECT
========================================================= */

export type ResumeProject = {
  name: string;

  description?: string;

  url?: string;
};

/* =========================================================
   CUSTOM SECTION
========================================================= */

export type ResumeCustomSection = {
  id: string;

  title: string;

  content: string;
};

/* =========================================================
   BUILDER DESIGN SETTINGS
========================================================= */

export type ResumeDesignSettings = {
  primary_color: string;

  heading_color: string;

  body_color: string;

  background_color: string;

  font_family: string;

  base_font_size: number;

  heading_scale: number;

  line_height: number;

  section_spacing: number;

  photo_shape:
    | "circle"
    | "rounded"
    | "square";

  hidden_sections: string[];
};

/* =========================================================
   DESIGN STUDIO ELEMENT TYPES
========================================================= */

export type ResumeCanvasElementType =
  | "text"
  | "photo"
  | "section"
  | "divider"
  | "shape";

/* =========================================================
   DESIGN STUDIO SECTION TYPES
========================================================= */

export type ResumeCanvasSectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "custom";

/* =========================================================
   TEXT ALIGNMENT
========================================================= */

export type ResumeTextAlign =
  | "left"
  | "center"
  | "right";

/* =========================================================
   RESUME CANVAS ELEMENT
========================================================= */

export type ResumeCanvasElement = {
  id: string;

  type:
    ResumeCanvasElementType;

  x: number;

  y: number;

  width: number;

  height: number;

  rotation: number;

  zIndex: number;

  /* =====================================================
     TEXT OPTIONS
  ===================================================== */

  content?: string;

  fontFamily?: string;

  fontSize?: number;

  fontWeight?: number;

  color?: string;

  backgroundColor?: string;

  textAlign?:
    ResumeTextAlign;

  lineHeight?: number;

  letterSpacing?: number;

  /* =====================================================
     SECTION OPTIONS
  ===================================================== */

  sectionType?:
    ResumeCanvasSectionType;

  customSectionId?:
    string;

  /* =====================================================
     PHOTO OPTIONS
  ===================================================== */

  imageSrc?: string | null;

  objectFit?:
    | "cover"
    | "contain";

  borderRadius?: number;

  /* =====================================================
     SHAPE / BORDER OPTIONS
  ===================================================== */

  borderColor?: string;

  borderWidth?: number;

  borderStyle?:
    | "solid"
    | "dashed"
    | "dotted";

  opacity?: number;

  /* =====================================================
     STATE
  ===================================================== */

  locked?: boolean;

  hidden?: boolean;
};

/* =========================================================
   CANVAS PAGE
========================================================= */

export type ResumeCanvasPage = {
  id: string;

  width: number;

  height: number;

  backgroundColor: string;

  elements:
    ResumeCanvasElement[];
};

/* =========================================================
   CANVAS DATA
========================================================= */

export type ResumeCanvasData = {
  version: number;

  pageSize:
    | "A4"
    | "LETTER";

  pages:
    ResumeCanvasPage[];

  selectedElementId?:
    string | null;
};

/* =========================================================
   RESUME
========================================================= */

export type Resume = {
  id: number;

  title: string;

  summary:
    string | null;

  phone:
    string | null;

  location:
    string | null;

  linkedin_url:
    string | null;

  github_url:
    string | null;

  portfolio_url:
    string | null;

  skills:
    string | null;

  experience:
    | ResumeExperience[]
    | string
    | null;

  education:
    | ResumeEducation[]
    | string
    | null;

  projects:
    | ResumeProject[]
    | string
    | null;

  template:
    ResumeTemplate;

  accent_color:
    ResumeAccentColor;

  profile_image:
    string | null;

  custom_sections:
    | ResumeCustomSection[]
    | string
    | null;

  design_settings:
    | ResumeDesignSettings
    | string
    | null;

  section_order:
    | string[]
    | string
    | null;

  /* =====================================================
     DESIGN STUDIO
  ===================================================== */

  editor_mode:
    ResumeEditorMode;

  canvas_data:
    | ResumeCanvasData
    | string
    | null;

  created_at:
    string;

  updated_at:
    string;
};

/* =========================================================
   CREATE / UPDATE PAYLOAD
========================================================= */

export type ResumePayload = {
  title: string;

  summary?: string;

  phone?: string;

  location?: string;

  linkedin_url?: string;

  github_url?: string;

  portfolio_url?: string;

  skills?: string;

  experience?:
    ResumeExperience[];

  education?:
    ResumeEducation[];

  projects?:
    ResumeProject[];

  template?:
    ResumeTemplate;

  accent_color?:
    ResumeAccentColor;

  profile_image?:
    string | null;

  custom_sections?:
    ResumeCustomSection[];

  design_settings?:
    ResumeDesignSettings;

  section_order?:
    string[];

  /* =====================================================
     DESIGN STUDIO
  ===================================================== */

  editor_mode?:
    ResumeEditorMode;

  canvas_data?:
    ResumeCanvasData | null;
};

/* =========================================================
   API RESPONSES
========================================================= */

export type ResumeListResponse = {
  message: string;

  resumes:
    Resume[];
};

export type ResumeResponse = {
  message: string;

  resume:
    Resume;
};

export type CreateResumeResponse = {
  message: string;

  resumeId: number;
};

export type ResumeActionResponse = {
  message: string;
};

/* =========================================================
   RESUME EDIT ROUTE
========================================================= */

export const getResumeEditPath = (
  resume: Pick<
    Resume,
    "id" | "editor_mode"
  >
) => {
  return resume.editor_mode === "studio"
    ? `/resumes/${resume.id}/studio`
    : `/resumes/${resume.id}/edit`;
};

/* =========================================================
   GET ALL RESUMES
========================================================= */

export const getResumes =
  async (): Promise<
    ResumeListResponse
  > => {
    return apiRequest(
      "/resumes",
      {
        method:
          "GET",
      }
    );
  };

/* =========================================================
   GET ONE RESUME
========================================================= */

export const getResumeById =
  async (
    id: number
  ): Promise<
    ResumeResponse
  > => {
    return apiRequest(
      `/resumes/${id}`,
      {
        method:
          "GET",
      }
    );
  };

/* =========================================================
   CREATE RESUME
========================================================= */

export const createResume =
  async (
    resumeData:
      ResumePayload
  ): Promise<
    CreateResumeResponse
  > => {
    return apiRequest(
      "/resumes",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            resumeData
          ),
      }
    );
  };

/* =========================================================
   UPDATE RESUME
========================================================= */

export const updateResume =
  async (
    id: number,

    resumeData:
      ResumePayload
  ): Promise<
    ResumeActionResponse
  > => {
    return apiRequest(
      `/resumes/${id}`,
      {
        method:
          "PUT",

        body:
          JSON.stringify(
            resumeData
          ),
      }
    );
  };

/* =========================================================
   DELETE RESUME
========================================================= */

export const deleteResume =
  async (
    id: number
  ): Promise<
    ResumeActionResponse
  > => {
    return apiRequest(
      `/resumes/${id}`,
      {
        method:
          "DELETE",
      }
    );
  };