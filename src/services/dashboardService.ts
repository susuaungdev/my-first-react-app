import { apiRequest } from "./api";

export type DashboardSummary = {
  totalApplications: number;
  interviews: number;
  offers: number;
  resumes: number;
};

export type RecentApplication = {
  id: number;
  company: string;
  job_title: string;
  status: string;
  location: string | null;
  date_applied: string | null;
  created_at: string;
};

export type DashboardResponse = {
  message: string;

  summary: DashboardSummary;

  recentApplications: RecentApplication[];
};

export const getDashboardSummary =
  async (): Promise<DashboardResponse> => {

    return apiRequest(
      "/dashboard/summary",
      {
        method: "GET",
      }
    );
  };