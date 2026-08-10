import { apiRequest } from "./api";

/* =========================================================
   APPLICATION TYPE
========================================================= */

export type Application = {
  id: number;

  company: string;

  job_title: string;

  location: string | null;

  job_url: string | null;

  salary: string | null;

  employment_type: string | null;

  description: string | null;

  date_applied: string | null;

  deadline: string | null;

  status: string;

  notes: string | null;

  interview_date: string | null;

  contact_person: string | null;

  /* =====================================================
     LINKED RESUME
  ===================================================== */

  resume_id: number | null;

  resume_title: string | null;

  created_at: string;

  updated_at: string;
};

/* =========================================================
   APPLICATION STATUS HISTORY TYPE
========================================================= */

export type ApplicationStatusHistory = {
  id: number;

  application_id: number;

  old_status: string | null;

  new_status: string;

  notes: string | null;

  changed_at: string;
};

/* =========================================================
   CREATE / UPDATE APPLICATION PAYLOAD
========================================================= */

export type CreateApplicationData = {
  company: string;

  job_title: string;

  location?: string;

  job_url?: string;

  salary?: string;

  employment_type?: string;

  description?: string;

  date_applied?: string;

  deadline?: string;

  status?: string;

  notes?: string;

  interview_date?: string;

  contact_person?: string;

  /* =====================================================
     LINKED RESUME
  ===================================================== */

  resume_id?: number | null;
};

/* =========================================================
   GET ALL APPLICATIONS
========================================================= */

export const getApplications =
  async () => {
    return apiRequest(
      "/applications",
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   GET ONE APPLICATION
========================================================= */

export const getApplicationById =
  async (
    id: number
  ) => {
    return apiRequest(
      `/applications/${id}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   GET APPLICATION STATUS HISTORY
========================================================= */

export const getApplicationStatusHistory =
  async (
    id: number
  ) => {
    return apiRequest(
      `/applications/${id}/status-history`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   CREATE APPLICATION
========================================================= */

export const createApplication =
  async (
    applicationData:
      CreateApplicationData
  ) => {
    return apiRequest(
      "/applications",
      {
        method: "POST",

        body: JSON.stringify(
          applicationData
        ),
      }
    );
  };

/* =========================================================
   UPDATE APPLICATION
========================================================= */

export const updateApplication =
  async (
    id: number,
    applicationData:
      CreateApplicationData
  ) => {
    return apiRequest(
      `/applications/${id}`,
      {
        method: "PUT",

        body: JSON.stringify(
          applicationData
        ),
      }
    );
  };

/* =========================================================
   DELETE APPLICATION
========================================================= */

export const deleteApplication =
  async (
    id: number
  ) => {
    return apiRequest(
      `/applications/${id}`,
      {
        method: "DELETE",
      }
    );
  };