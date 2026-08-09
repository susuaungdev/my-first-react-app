import { apiRequest } from "./api";

/* =========================================================
   TEMPLATE TYPES
========================================================= */

export type ResumeTemplate =
  | "classic"
  | "modern"
  | "professional"
  | "minimal"
  | "executive"
  | "creative";

export type ResumeAccentColor =
  | "blue"
  | "emerald"
  | "purple"
  | "rose"
  | "slate"
  | "orange";

/* =========================================================
   RESUME EXPERIENCE
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
   RESUME EDUCATION
========================================================= */

export type ResumeEducation = {
  school: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
};

/* =========================================================
   RESUME PROJECT
========================================================= */

export type ResumeProject = {
  name: string;
  description?: string;
  url?: string;
};

/* =========================================================
   RESUME
========================================================= */

export type Resume = {
  id: number;

  title: string;

  summary: string | null;

  phone: string | null;

  location: string | null;

  linkedin_url: string | null;

  github_url: string | null;

  portfolio_url: string | null;

  skills: string | null;

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

  template: ResumeTemplate;

  accent_color: ResumeAccentColor;

  created_at: string;

  updated_at: string;
};

/* =========================================================
   RESUME PAYLOAD
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

  experience?: ResumeExperience[];

  education?: ResumeEducation[];

  projects?: ResumeProject[];

  template?: ResumeTemplate;

  accent_color?: ResumeAccentColor;
};

/* =========================================================
   API RESPONSES
========================================================= */

export type ResumeListResponse = {
  message: string;

  resumes: Resume[];
};

export type ResumeResponse = {
  message: string;

  resume: Resume;
};

export type CreateResumeResponse = {
  message: string;

  resumeId: number;
};

export type ResumeActionResponse = {
  message: string;
};

/* =========================================================
   GET ALL RESUMES
========================================================= */

export const getResumes =
  async (): Promise<ResumeListResponse> => {
    return apiRequest(
      "/resumes",
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   GET ONE RESUME
========================================================= */

export const getResumeById =
  async (
    id: number
  ): Promise<ResumeResponse> => {
    return apiRequest(
      `/resumes/${id}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   CREATE RESUME
========================================================= */

export const createResume =
  async (
    resumeData: ResumePayload
  ): Promise<CreateResumeResponse> => {
    return apiRequest(
      "/resumes",
      {
        method: "POST",

        body: JSON.stringify(
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
    resumeData: ResumePayload
  ): Promise<ResumeActionResponse> => {
    return apiRequest(
      `/resumes/${id}`,
      {
        method: "PUT",

        body: JSON.stringify(
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
  ): Promise<ResumeActionResponse> => {
    return apiRequest(
      `/resumes/${id}`,
      {
        method: "DELETE",
      }
    );
  };