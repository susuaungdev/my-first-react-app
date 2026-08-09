import {
  apiRequest,
} from "./api";


export type Profile = {
  id: number | null;

  user_id:
    | number
    | null;

  profile_picture:
    | string
    | null;

  name: string;
  email: string;

  phone:
    | string
    | null;

  location:
    | string
    | null;

  professional_title:
    | string
    | null;

  bio:
    | string
    | null;

  skills:
    | string
    | null;

  experience_level:
    | string
    | null;

  linkedin_url:
    | string
    | null;

  github_url:
    | string
    | null;

  portfolio_url:
    | string
    | null;

  created_at:
    | string
    | null;

  updated_at:
    | string
    | null;
};


export type ProfileResponse = {
  message: string;

  profile: Profile;
};


export const getProfile =
  async (): Promise<ProfileResponse> => {

    return apiRequest(
      "/profile",
      {
        method: "GET",
      }
    );
  };


export const saveProfile =
  async (
    formData: FormData
  ) => {

    return apiRequest(
      "/profile",
      {
        method: "PUT",

        body:
          formData,
      }
    );
  };