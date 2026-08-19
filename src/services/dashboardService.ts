import {
  apiRequest,
} from "./api";

/* =========================================================
   DASHBOARD SUMMARY TYPE
========================================================= */

export type DashboardSummary = {
  totalApplications: number;
  interviews: number;
  offers: number;
  resumes: number;
};

/* =========================================================
   RECENT APPLICATION TYPE
========================================================= */

export type RecentApplication = {
  id: number;
  company: string;
  job_title: string;
  status: string;
  location: string | null;
  date_applied: string | null;
  created_at: string;
};

/* =========================================================
   DASHBOARD RESPONSE TYPE
========================================================= */

export type DashboardResponse = {
  message: string;

  summary: DashboardSummary;

  recentApplications: RecentApplication[];
};

/* =========================================================
   GET DASHBOARD SUMMARY
========================================================= */

export const getDashboardSummary =
  async (): Promise<DashboardResponse> => {
    return apiRequest(
      "/dashboard/summary",
      {
        method: "GET",
      }
    );
  };