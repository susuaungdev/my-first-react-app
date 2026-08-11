import { apiRequest } from "./api";

/* =========================================================
   SAVED JOB TYPE
========================================================= */

export type SavedJob = {
  id: number;

  company: string;

  job_title: string;

  location: string | null;

  salary: string | null;

  employment_type: string | null;

  job_url: string | null;

  description: string | null;

  deadline: string | null;

  notes: string | null;

  saved_at: string;

  created_at: string;

  updated_at: string;
};

/* =========================================================
   CREATE / UPDATE DATA
========================================================= */

export type SavedJobData = {
  company: string;

  job_title: string;

  location?: string;

  salary?: string;

  employment_type?: string;

  job_url?: string;

  description?: string;

  deadline?: string;

  notes?: string;
};

/* =========================================================
   RESPONSE TYPES
========================================================= */

export type SavedJobsResponse = {
  message: string;

  savedJobs: SavedJob[];
};

export type SavedJobResponse = {
  message: string;

  savedJob: SavedJob;
};

export type SavedJobActionResponse = {
  message: string;
};

/* =========================================================
   GET ALL
========================================================= */

export const getSavedJobs =
  async (): Promise<SavedJobsResponse> => {
    return apiRequest(
      "/saved-jobs",
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   GET ONE
========================================================= */

export const getSavedJobById =
  async (
    id: number
  ): Promise<SavedJobResponse> => {
    return apiRequest(
      `/saved-jobs/${id}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   CREATE
========================================================= */

export const createSavedJob =
  async (
    savedJobData:
      SavedJobData
  ): Promise<SavedJobResponse> => {
    return apiRequest(
      "/saved-jobs",
      {
        method: "POST",

        body:
          JSON.stringify(
            savedJobData
          ),
      }
    );
  };

/* =========================================================
   UPDATE
========================================================= */

export const updateSavedJob =
  async (
    id: number,
    savedJobData:
      SavedJobData
  ): Promise<SavedJobResponse> => {
    return apiRequest(
      `/saved-jobs/${id}`,
      {
        method: "PUT",

        body:
          JSON.stringify(
            savedJobData
          ),
      }
    );
  };

/* =========================================================
   DELETE
========================================================= */

export const deleteSavedJob =
  async (
    id: number
  ): Promise<SavedJobActionResponse> => {
    return apiRequest(
      `/saved-jobs/${id}`,
      {
        method:
          "DELETE",
      }
    );
  };