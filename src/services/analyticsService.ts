import { apiRequest } from "./api";

/* =========================================================
   APPLICATION ANALYTICS
========================================================= */

export type ApplicationAnalytics = {
  total: number;

  saved: number;

  applied: number;

  screening: number;

  interview: number;

  offers: number;

  rejected: number;

  withdrawn: number;
};

/* =========================================================
   INTERVIEW ANALYTICS
========================================================= */

export type InterviewAnalytics = {
  total: number;

  pending: number;

  passed: number;

  failed: number;

  offers: number;

  cancelled: number;
};

/* =========================================================
   SAVED JOB ANALYTICS
========================================================= */

export type SavedJobAnalytics = {
  total: number;

  noDeadline: number;

  expired: number;

  next7Days: number;
};

/* =========================================================
   RATE ANALYTICS
========================================================= */

export type RateAnalytics = {
  interviewRate: number;

  offerRate: number;

  rejectionRate: number;
};

/* =========================================================
   DISTRIBUTION TYPES
========================================================= */

export type ApplicationStatusDistribution = {
  status: string;

  count: number;
};

export type InterviewResultDistribution = {
  result: string;

  count: number;
};

export type ApplicationsByMonth = {
  month: string;

  count: number;
};

/* =========================================================
   UPCOMING INTERVIEW
========================================================= */

export type AnalyticsUpcomingInterview = {
  id: number;

  application_id: number;

  interview_type: string;

  scheduled_at: string;

  timezone: string | null;

  interviewer_name: string | null;

  location: string | null;

  meeting_url: string | null;

  result: string | null;

  company: string;

  job_title: string;
};

/* =========================================================
   RECENT APPLICATION
========================================================= */

export type AnalyticsRecentApplication = {
  id: number;

  company: string;

  job_title: string;

  status: string;

  date_applied: string | null;

  created_at: string;

  updated_at: string;
};

/* =========================================================
   FULL ANALYTICS RESPONSE
========================================================= */

export type AnalyticsOverviewResponse = {
  message: string;

  applications:
    ApplicationAnalytics;

  interviews:
    InterviewAnalytics;

  savedJobs:
    SavedJobAnalytics;

  rates:
    RateAnalytics;

  applicationStatusDistribution:
    ApplicationStatusDistribution[];

  interviewResultDistribution:
    InterviewResultDistribution[];

  applicationsByMonth:
    ApplicationsByMonth[];

  upcomingInterviews:
    AnalyticsUpcomingInterview[];

  recentApplications:
    AnalyticsRecentApplication[];
};

/* =========================================================
   GET ANALYTICS OVERVIEW
========================================================= */

export const getAnalyticsOverview =
  async (): Promise<AnalyticsOverviewResponse> => {
    return apiRequest(
      "/analytics/overview",
      {
        method: "GET",
      }
    );
  };