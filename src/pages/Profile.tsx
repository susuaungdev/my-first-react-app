import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

import {
  getProfile,
  saveProfile,
  type Profile as ProfileType,
} from "../services/profileService";

const BACKEND_URL =
  "http://localhost:5000";

/* =========================================================
   ICONS
========================================================= */

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.5 8.5H3V21h3.5V8.5ZM4.75 3A2.05 2.05 0 1 0 4.75 7.1 2.05 2.05 0 0 0 4.75 3ZM21 13.8c0-3.75-2-5.5-4.65-5.5-2.15 0-3.1 1.18-3.65 2V8.5H9.2V21h3.5v-6.2c0-1.65.3-3.25 2.35-3.25 2 0 2.05 1.9 2.05 3.35V21H21v-7.2Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.95a9.3 9.3 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.78c0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M3 12h18" />

      <path d="M12 3c2.2 2.5 3.4 5.5 3.4 9S14.2 18.5 12 21" />

      <path d="M12 3c-2.2 2.5-3.4 5.5-3.4 9S9.8 18.5 12 21" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.9Z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
      />

      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />

      <path d="M3 12h18" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M14.5 4 16 6h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1.5-2Z" />

      <circle
        cx="12"
        cy="13"
        r="4"
      />
    </svg>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function Profile() {
  const navigate =
    useNavigate();

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const storedUser =
    localStorage.getItem(
      "user"
    );

  const user =
    storedUser
      ? JSON.parse(storedUser)
      : null;

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  };

  /* =========================================================
     PROFILE STATE
  ========================================================= */

  const [
    profile,
    setProfile,
  ] =
    useState<ProfileType | null>(
      null
    );

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [phone, setPhone] =
    useState("");

  const [
    location,
    setLocation,
  ] =
    useState("");

  const [
    professionalTitle,
    setProfessionalTitle,
  ] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [skills, setSkills] =
    useState("");

  const [
    experienceLevel,
    setExperienceLevel,
  ] =
    useState("");

  const [
    linkedinUrl,
    setLinkedinUrl,
  ] =
    useState("");

  const [
    githubUrl,
    setGithubUrl,
  ] =
    useState("");

  const [
    portfolioUrl,
    setPortfolioUrl,
  ] =
    useState("");

  const [
    profilePicture,
    setProfilePicture,
  ] =
    useState<File | null>(
      null
    );

  const [
    picturePreview,
    setPicturePreview,
  ] =
    useState<string | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================================
     FILL FORM
  ========================================================= */

  const fillForm = (
    data: ProfileType
  ) => {
    setPhone(
      data.phone || ""
    );

    setLocation(
      data.location || ""
    );

    setProfessionalTitle(
      data.professional_title ||
        ""
    );

    setBio(
      data.bio || ""
    );

    setSkills(
      data.skills || ""
    );

    setExperienceLevel(
      data.experience_level ||
        ""
    );

    setLinkedinUrl(
      data.linkedin_url ||
        ""
    );

    setGithubUrl(
      data.github_url ||
        ""
    );

    setPortfolioUrl(
      data.portfolio_url ||
        ""
    );
  };

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  const loadProfile =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProfile();

        setProfile(
          data.profile
        );

        fillForm(
          data.profile
        );
      } catch (error) {
        console.error(error);

        if (
          error instanceof Error
        ) {
          setError(
            error.message
          );
        } else {
          setError(
            "Failed to load profile."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (
        picturePreview
      ) {
        URL.revokeObjectURL(
          picturePreview
        );
      }
    };
  }, [picturePreview]);

  /* =========================================================
     PICTURE
  ========================================================= */

  const handlePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please choose a JPG, PNG, or WebP image."
      );

      toast.error(
        "Please choose a JPG, PNG, or WebP image."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Profile picture must be smaller than 5 MB."
      );

      toast.error(
        "Profile picture must be smaller than 5 MB."
      );

      return;
    }

    setError("");

    setProfilePicture(
      file
    );

    if (
      picturePreview
    ) {
      URL.revokeObjectURL(
        picturePreview
      );
    }

    setPicturePreview(
      URL.createObjectURL(file)
    );
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    if (profile) {
      fillForm(profile);
    }

    setProfilePicture(
      null
    );

    if (
      picturePreview
    ) {
      URL.revokeObjectURL(
        picturePreview
      );

      setPicturePreview(
        null
      );
    }

    setError("");
    setEditing(false);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData =
        new FormData();

      formData.append(
        "phone",
        phone
      );

      formData.append(
        "location",
        location
      );

      formData.append(
        "professional_title",
        professionalTitle
      );

      formData.append(
        "bio",
        bio
      );

      formData.append(
        "skills",
        skills
      );

      formData.append(
        "experience_level",
        experienceLevel
      );

      formData.append(
        "linkedin_url",
        linkedinUrl
      );

      formData.append(
        "github_url",
        githubUrl
      );

      formData.append(
        "portfolio_url",
        portfolioUrl
      );

      if (
        profilePicture
      ) {
        formData.append(
          "profile_picture",
          profilePicture
        );
      }

      await saveProfile(
        formData
      );

      const refreshed =
        await getProfile();

      setProfile(
        refreshed.profile
      );

      fillForm(
        refreshed.profile
      );

      setProfilePicture(
        null
      );

      if (
        picturePreview
      ) {
        URL.revokeObjectURL(
          picturePreview
        );

        setPicturePreview(
          null
        );
      }

      setEditing(false);

      toast.success(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );

        toast.error(
          error.message
        );
      } else {
        setError(
          "Failed to save profile."
        );

        toast.error(
          "Failed to save profile."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DISPLAY
  ========================================================= */

  const currentPicture =
    picturePreview
      ? picturePreview
      : profile?.profile_picture
      ? `${BACKEND_URL}${profile.profile_picture}`
      : null;

  const skillsList =
    profile?.skills
      ? profile.skills
          .split(",")
          .map((skill) =>
            skill.trim()
          )
          .filter(Boolean)
      : [];

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* MOBILE HEADER */}

        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
            aria-label="Open menu"
          >
            ☰
          </button>

          <h1 className="text-lg font-bold text-blue-600">
            CareerFlow
          </h1>

          <div className="h-10 w-10" />
        </header>

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
          user={user}
          onLogout={handleLogout}
        />

        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center lg:ml-64 lg:min-h-screen">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-white">
      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() =>
            setSidebarOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          aria-label="Open menu"
        >
          <span className="text-xl">
            ☰
          </span>
        </button>

        <h1 className="text-lg font-bold text-blue-600">
          CareerFlow
        </h1>

        <div className="h-10 w-10" />
      </header>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        user={user}
        onLogout={handleLogout}
      />

      {/* =====================================================
          PAGE AREA
      ===================================================== */}

      <div className="min-w-0 lg:ml-64">
        {/* ===================================================
            DASHBOARD HEADER
        =================================================== */}

        <DashboardHeader
          user={user}
        />


        {/* ===================================================
            SMALL COVER
        =================================================== */}

        {!editing && (
          <div className="relative h-24 overflow-hidden bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 sm:h-28 lg:h-32">
            <div className="absolute -left-20 -top-24 h-52 w-52 rounded-full bg-blue-200/30 blur-3xl" />

            <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full bg-indigo-100/40 blur-3xl" />
          </div>
        )}

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          {error && (
            <div className="relative z-20 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!editing ? (
            /* ===============================================
               PROFILE VIEW
            =============================================== */

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
              {/* LEFT PROFILE COLUMN */}

              <aside className="relative z-10 -mt-14 min-w-0 sm:-mt-16">
                {/* AVATAR */}

                {currentPicture ? (
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-sm sm:h-32 sm:w-32">
                    <img
                      src={
                        currentPicture
                      }
                      alt="Profile"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-3xl font-bold text-white shadow-sm sm:h-32 sm:w-32 sm:text-4xl">
                    {profile?.name
                      ?.charAt(0)
                      .toUpperCase() ||
                      "U"}
                  </div>
                )}

                {/* NAME */}

                <div className="mt-4 sm:mt-5">
                  <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900">
                    {profile?.name ||
                      "CareerFlow User"}
                  </h1>

                  <p className="mt-1 break-words text-sm text-slate-500">
                    {profile?.professional_title ||
                      "Add your professional title"}
                  </p>
                </div>

                {/* MANAGE */}

                <button
                  onClick={() => {
                    setEditing(true);
                  }}
                  className="mt-5 w-full rounded-md bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Manage your profile
                </button>

                {/* ABOUT CARD */}

                <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    About
                  </p>

                  <div className="mt-5 space-y-5">
                    <SidebarInfo
                      icon={
                        <BriefcaseIcon />
                      }
                      value={
                        profile?.professional_title ||
                        "Job title not added"
                      }
                    />

                    <SidebarInfo
                      icon={
                        <LocationIcon />
                      }
                      value={
                        profile?.location ||
                        "Location not added"
                      }
                    />

                    <SidebarInfo
                      icon={
                        <PhoneIcon />
                      }
                      value={
                        profile?.phone ||
                        "Phone not added"
                      }
                    />
                  </div>

                  <div className="my-6 border-t border-slate-100" />

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Contact
                  </p>

                  <div className="mt-5">
                    <SidebarInfo
                      icon={
                        <MailIcon />
                      }
                      value={
                        profile?.email ||
                        "Email not available"
                      }
                    />
                  </div>

                  <div className="my-6 border-t border-slate-100" />

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Links
                  </p>

                  <div className="mt-4 space-y-2">
                    <SidebarSocialLink
                      label="LinkedIn"
                      url={
                        profile?.linkedin_url
                      }
                      icon={
                        <LinkedInIcon />
                      }
                    />

                    <SidebarSocialLink
                      label="GitHub"
                      url={
                        profile?.github_url
                      }
                      icon={
                        <GitHubIcon />
                      }
                    />

                    <SidebarSocialLink
                      label="Portfolio"
                      url={
                        profile?.portfolio_url
                      }
                      icon={
                        <GlobeIcon />
                      }
                    />
                  </div>
                </div>
              </aside>

              {/* =============================================
                  RIGHT CONTENT
              ============================================= */}

              <div className="min-w-0 pt-1 lg:pt-8">
                <ContentSection title="About me">
                  <p className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {profile?.bio ||
                      "Add a short professional introduction to help describe your experience, strengths, and career goals."}
                  </p>
                </ContentSection>

                <ContentSection title="Professional information">
                  <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
                    <InformationItem
                      label="Professional title"
                      value={
                        profile?.professional_title ||
                        "Not added"
                      }
                    />

                    <InformationItem
                      label="Experience level"
                      value={
                        profile?.experience_level ||
                        "Not added"
                      }
                    />

                    <InformationItem
                      label="Location"
                      value={
                        profile?.location ||
                        "Not added"
                      }
                    />

                    <InformationItem
                      label="Phone number"
                      value={
                        profile?.phone ||
                        "Not added"
                      }
                    />
                  </div>
                </ContentSection>

                <ContentSection title="Skills">
                  {skillsList.length >
                  0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skillsList.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No skills have been added yet.
                    </p>
                  )}
                </ContentSection>

                <ContentSection title="Online presence">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <LargeSocialLink
                      label="LinkedIn"
                      description="Professional network"
                      url={
                        profile?.linkedin_url
                      }
                      icon={
                        <LinkedInIcon />
                      }
                    />

                    <LargeSocialLink
                      label="GitHub"
                      description="Projects and source code"
                      url={
                        profile?.github_url
                      }
                      icon={
                        <GitHubIcon />
                      }
                    />

                    <LargeSocialLink
                      label="Portfolio"
                      description="Personal website"
                      url={
                        profile?.portfolio_url
                      }
                      icon={
                        <GlobeIcon />
                      }
                    />
                  </div>
                </ContentSection>
              </div>
            </div>
          ) : (
            /* ===============================================
               EDIT PROFILE
            =============================================== */

            <form
              onSubmit={handleSave}
              className="mx-auto max-w-4xl py-6 sm:py-8 lg:py-10"
            >
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* EDIT HEADER */}

                <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
                  <h1 className="text-xl font-bold text-slate-900">
                    Edit profile
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Update your CareerFlow professional profile.
                  </p>
                </div>

                {/* PROFILE PHOTO */}

                <div className="border-b border-slate-100 px-5 py-6 sm:px-7">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Profile photo
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your profile image will be shown across CareerFlow.
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                      {currentPicture ? (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                          <img
                            src={
                              currentPicture
                            }
                            alt="Profile preview"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                          {profile?.name
                            ?.charAt(0)
                            .toUpperCase() ||
                            "U"}
                        </div>
                      )}

                      <div className="min-w-0">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <CameraIcon />

                          Change photo

                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={
                              handlePictureChange
                            }
                            className="hidden"
                          />
                        </label>

                        <p className="mt-2 text-xs text-slate-400">
                          JPG, PNG or WebP.
                          Maximum 5 MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACCOUNT */}

                <FormSection
                  title="Account"
                  description="Your account information."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ReadOnlyField
                      label="Full name"
                      value={
                        profile?.name ||
                        ""
                      }
                    />

                    <ReadOnlyField
                      label="Email"
                      value={
                        profile?.email ||
                        ""
                      }
                    />
                  </div>
                </FormSection>

                {/* PROFESSIONAL */}

                <FormSection
                  title="Professional information"
                  description="Information about your career."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField
                      label="Professional title"
                      value={
                        professionalTitle
                      }
                      onChange={
                        setProfessionalTitle
                      }
                      placeholder="Frontend Developer"
                    />

                    <div>
                      <Label>
                        Experience level
                      </Label>

                      <select
                        value={
                          experienceLevel
                        }
                        onChange={(e) =>
                          setExperienceLevel(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">
                          Select level
                        </option>

                        <option value="Entry Level">
                          Entry Level
                        </option>

                        <option value="Junior">
                          Junior
                        </option>

                        <option value="Mid Level">
                          Mid Level
                        </option>

                        <option value="Senior">
                          Senior
                        </option>

                        <option value="Lead">
                          Lead
                        </option>

                        <option value="Manager">
                          Manager
                        </option>

                        <option value="Executive">
                          Executive
                        </option>
                      </select>
                    </div>

                    <InputField
                      label="Location"
                      value={location}
                      onChange={
                        setLocation
                      }
                      placeholder="Yangon, Myanmar"
                    />

                    <InputField
                      label="Phone"
                      value={phone}
                      onChange={
                        setPhone
                      }
                      placeholder="+95 9..."
                    />

                    <div className="sm:col-span-2">
                      <Label>
                        Professional bio
                      </Label>

                      <textarea
                        rows={5}
                        value={bio}
                        onChange={(e) =>
                          setBio(
                            e.target.value
                          )
                        }
                        placeholder="Tell people about your professional background..."
                        className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label>
                        Skills
                      </Label>

                      <textarea
                        rows={3}
                        value={skills}
                        onChange={(e) =>
                          setSkills(
                            e.target.value
                          )
                        }
                        placeholder="React, TypeScript, Node.js, MySQL..."
                        className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <p className="mt-1.5 text-xs text-slate-400">
                        Separate skills
                        with commas.
                      </p>
                    </div>
                  </div>
                </FormSection>

                {/* SOCIAL */}

                <FormSection
                  title="Online presence"
                  description="Professional profiles and websites."
                >
                  <div className="space-y-4">
                    <SocialInput
                      label="LinkedIn"
                      value={
                        linkedinUrl
                      }
                      onChange={
                        setLinkedinUrl
                      }
                      placeholder="https://linkedin.com/in/username"
                      icon={
                        <LinkedInIcon />
                      }
                    />

                    <SocialInput
                      label="GitHub"
                      value={
                        githubUrl
                      }
                      onChange={
                        setGithubUrl
                      }
                      placeholder="https://github.com/username"
                      icon={
                        <GitHubIcon />
                      }
                    />

                    <SocialInput
                      label="Portfolio"
                      value={
                        portfolioUrl
                      }
                      onChange={
                        setPortfolioUrl
                      }
                      placeholder="https://yourportfolio.com"
                      icon={
                        <GlobeIcon />
                      }
                    />
                  </div>
                </FormSection>

                {/* FOOTER */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                  <button
                    type="button"
                    onClick={
                      handleCancel
                    }
                    disabled={
                      saving
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="w-full rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {saving
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   VIEW COMPONENTS
========================================================= */

type SidebarInfoProps = {
  icon: ReactNode;
  value: string;
};

function SidebarInfo({
  icon,
  value,
}: SidebarInfoProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 shrink-0 text-slate-500">
        {icon}
      </div>

      <p className="min-w-0 break-words text-sm leading-5 text-slate-600">
        {value}
      </p>
    </div>
  );
}

type SidebarSocialLinkProps = {
  label: string;

  url?:
    | string
    | null;

  icon: ReactNode;
};

function SidebarSocialLink({
  label,
  url,
  icon,
}: SidebarSocialLinkProps) {
  if (!url) {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-md px-1 py-2 text-slate-400">
        <span className="shrink-0">
          {icon}
        </span>

        <span className="min-w-0 text-sm">
          {label}
        </span>

        <span className="ml-auto shrink-0 text-xs">
          Not added
        </span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 items-center gap-3 rounded-md px-1 py-2 text-slate-600 transition hover:text-blue-600"
    >
      <span className="shrink-0">
        {icon}
      </span>

      <span className="min-w-0 truncate text-sm font-medium">
        {label}
      </span>

      <span className="ml-auto shrink-0">
        ↗
      </span>
    </a>
  );
}

type ContentSectionProps = {
  title: string;
  children: ReactNode;
};

function ContentSection({
  title,
  children,
}: ContentSectionProps) {
  return (
    <section className="border-b border-slate-200 py-6 first:pt-0 last:border-0 sm:py-7">
      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>

      <div className="mt-4 min-w-0">
        {children}
      </div>
    </section>
  );
}

type InformationItemProps = {
  label: string;
  value: string;
};

function InformationItem({
  label,
  value,
}: InformationItemProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

type LargeSocialLinkProps = {
  label: string;
  description: string;

  url?:
    | string
    | null;

  icon: ReactNode;
};

function LargeSocialLink({
  label,
  description,
  url,
  icon,
}: LargeSocialLinkProps) {
  if (!url) {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 px-4 py-3 text-slate-400">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {label}
          </p>

          <p className="truncate text-xs">
            Not added
          </p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-0 items-center gap-3 rounded-md border border-slate-200 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/30"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-600 group-hover:text-blue-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {label}
        </p>

        <p className="truncate text-xs text-slate-500">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-slate-400 group-hover:text-blue-600">
        ↗
      </span>
    </a>
  );
}

/* =========================================================
   EDIT COMPONENTS
========================================================= */

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="border-b border-slate-100 px-5 py-6 last:border-0 sm:px-7">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div className="min-w-0">
          {children}
        </div>
      </div>
    </section>
  );
}

function Label({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

type ReadOnlyFieldProps = {
  label: string;
  value: string;
};

function ReadOnlyField({
  label,
  value,
}: ReadOnlyFieldProps) {
  return (
    <div className="min-w-0">
      <Label>
        {label}
      </Label>

      <input
        type="text"
        value={value}
        readOnly
        disabled
        className="w-full min-w-0 cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
      />
    </div>
  );
}

type InputFieldProps = {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  placeholder?: string;
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  return (
    <div className="min-w-0">
      <Label>
        {label}
      </Label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

type SocialInputProps = {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  placeholder: string;
  icon: ReactNode;
};

function SocialInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: SocialInputProps) {
  return (
    <div className="min-w-0">
      <Label>
        {label}
      </Label>

      <div className="relative min-w-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          {icon}
        </div>

        <input
          type="url"
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          placeholder={
            placeholder
          }
          className="w-full min-w-0 rounded-lg border border-slate-300 bg-white py-2.5 pl-11 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

export default Profile;