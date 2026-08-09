import { apiRequest } from "./api";

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
  created_at: string;
  updated_at: string;
};

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
};


export const getApplications = async () => {
  return apiRequest(
    "/applications",
    {
      method: "GET",
    }
  );
};


export const createApplication = async (
  applicationData: CreateApplicationData
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


export const updateApplication = async (
  id: number,
  applicationData: CreateApplicationData
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


export const deleteApplication = async (
  id: number
) => {
  return apiRequest(
    `/applications/${id}`,
    {
      method: "DELETE",
    }
  );
};