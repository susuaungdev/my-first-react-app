import { apiRequest } from "./api";

/* =========================================================
   INTERVIEW TYPE
========================================================= */

export type Interview = {
  id: number;

  application_id: number;

  interview_type: string;

  scheduled_at: string;

  timezone: string | null;

  interviewer_name: string | null;

  interviewer_email: string | null;

  location: string | null;

  meeting_url: string | null;

  notes: string | null;

  preparation_notes: string | null;

  result: string | null;

  follow_up_date: string | null;

  created_at: string;

  updated_at: string;

  /* =====================================================
     APPLICATION INFORMATION
     Returned by GET /api/interviews
     and GET /api/interviews/:id
  ===================================================== */

  company?: string;

  job_title?: string;

  application_status?: string;
};

/* =========================================================
   CREATE INTERVIEW PAYLOAD
========================================================= */

export type CreateInterviewData = {
  application_id: number;

  interview_type: string;

  scheduled_at: string;

  timezone?: string;

  interviewer_name?: string;

  interviewer_email?: string;

  location?: string;

  meeting_url?: string;

  notes?: string;

  preparation_notes?: string;

  result?: string;

  follow_up_date?: string;
};

/* =========================================================
   UPDATE INTERVIEW PAYLOAD
========================================================= */

export type UpdateInterviewData = {
  interview_type: string;

  scheduled_at: string;

  timezone?: string;

  interviewer_name?: string;

  interviewer_email?: string;

  location?: string;

  meeting_url?: string;

  notes?: string;

  preparation_notes?: string;

  result?: string;

  follow_up_date?: string;
};

/* =========================================================
   RESPONSE TYPES
========================================================= */

export type InterviewListResponse = {
  message: string;

  interviews: Interview[];
};

export type InterviewResponse = {
  message: string;

  interview: Interview;
};

export type InterviewActionResponse = {
  message: string;
};

/* =========================================================
   GET ALL INTERVIEWS
========================================================= */

export const getInterviews =
  async (): Promise<InterviewListResponse> => {
    return apiRequest(
      "/interviews",
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   GET ONE INTERVIEW
========================================================= */

export const getInterviewById =
  async (
    id: number
  ): Promise<InterviewResponse> => {
    return apiRequest(
      `/interviews/${id}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   GET INTERVIEWS FOR ONE APPLICATION
========================================================= */

export const getApplicationInterviews =
  async (
    applicationId: number
  ): Promise<InterviewListResponse> => {
    return apiRequest(
      `/interviews/application/${applicationId}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   CREATE INTERVIEW
========================================================= */

export const createInterview =
  async (
    interviewData:
      CreateInterviewData
  ): Promise<InterviewResponse> => {
    return apiRequest(
      "/interviews",
      {
        method: "POST",

        body: JSON.stringify(
          interviewData
        ),
      }
    );
  };

/* =========================================================
   UPDATE INTERVIEW
========================================================= */

export const updateInterview =
  async (
    id: number,
    interviewData:
      UpdateInterviewData
  ): Promise<InterviewActionResponse> => {
    return apiRequest(
      `/interviews/${id}`,
      {
        method: "PUT",

        body: JSON.stringify(
          interviewData
        ),
      }
    );
  };

/* =========================================================
   DELETE INTERVIEW
========================================================= */

export const deleteInterview =
  async (
    id: number
  ): Promise<InterviewActionResponse> => {
    return apiRequest(
      `/interviews/${id}`,
      {
        method: "DELETE",
      }
    );
  };