import {
  Request,
  Response,
} from "express";

import db from "../config/db";

const allowedTemplates = new Set([
  "classic",
  "modern",
  "professional",
  "minimal",
  "executive",
  "creative",
  "elegant",
  "bold",
  "sidebar",
  "compact",
  "serif",
  "contemporary",
]);

const allowedAccentColors = new Set([
  "blue",
  "emerald",
  "purple",
  "rose",
  "slate",
  "orange",
]);

const allowedEditorModes = new Set([
  "builder",
  "studio",
]);

const allowedPhotoShapes = new Set([
  "circle",
  "rounded",
  "square",
]);

const allowedFonts = new Set([
  "Inter, Arial, sans-serif",
  "Arial, sans-serif",
  "Georgia, serif",
  "Garamond, Georgia, serif",
  '"Times New Roman", serif',
  '"Trebuchet MS", Arial, sans-serif',
  "Verdana, Arial, sans-serif",
  "Tahoma, Arial, sans-serif",
  '"Palatino Linotype", Palatino, serif',
  '"Courier New", monospace',
]);

const cleanString = (
  value: unknown,
  maxLength: number
) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

const clamp = (
  value: unknown,
  min: number,
  max: number,
  fallback: number
) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
};

const hexColor = (
  value: unknown,
  fallback: string
) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toUpperCase();

  return /^#[0-9A-F]{6}$/.test(normalized)
    ? normalized
    : fallback;
};

const validateProfileImage = (
  value: unknown
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Invalid profile image.");
  }

  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(value)) {
    throw new Error("Profile image must be JPG, PNG, or WebP.");
  }

  if (value.length > 2_300_000) {
    throw new Error("Profile image is too large.");
  }

  return value;
};

const serializeArray = (
  value: unknown
) => {
  return Array.isArray(value)
    ? JSON.stringify(value)
    : null;
};

const sanitizeCustomSections = (
  value: unknown
) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, 20)
    .map((item) => {
      const record =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};

      return {
        id:
          cleanString(record.id, 120) ||
          `custom-${Math.random().toString(36).slice(2)}`,
        title: cleanString(record.title, 120),
        content: cleanString(record.content, 10000),
      };
    })
    .filter((item) => item.title || item.content);
};

const sanitizeDesignSettings = (
  value: unknown
) => {
  const input =
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const requestedFont = cleanString(input.font_family, 150);
  const fontFamily = allowedFonts.has(requestedFont)
    ? requestedFont
    : "Inter, Arial, sans-serif";

  const requestedShape = cleanString(input.photo_shape, 30);
  const photoShape = allowedPhotoShapes.has(requestedShape)
    ? requestedShape
    : "circle";

  const hiddenSections = Array.isArray(input.hidden_sections)
    ? Array.from(
        new Set(
          input.hidden_sections
            .filter((item) => typeof item === "string")
            .map((item) => (item as string).trim().slice(0, 120))
            .filter(Boolean)
        )
      ).slice(0, 50)
    : [];

  return {
    primary_color: hexColor(input.primary_color, "#2563EB"),
    heading_color: hexColor(input.heading_color, "#0F172A"),
    body_color: hexColor(input.body_color, "#334155"),
    background_color: hexColor(input.background_color, "#FFFFFF"),
    font_family: fontFamily,
    base_font_size: clamp(input.base_font_size, 11, 18, 14),
    heading_scale: clamp(input.heading_scale, 0.8, 1.5, 1),
    line_height: clamp(input.line_height, 1.2, 2, 1.55),
    section_spacing: clamp(input.section_spacing, 10, 40, 22),
    photo_shape: photoShape,
    hidden_sections: hiddenSections,
  };
};

const sanitizeSectionOrder = (
  value: unknown,
  customSections: Array<{ id: string }>
) => {
  const builtIn = [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
  ];

  const allowed = new Set([
    ...builtIn,
    ...customSections.map((section) => section.id),
  ]);

  const requested = Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string")
        .map((item) => (item as string).trim())
        .filter((item) => allowed.has(item))
    : [];

  const unique = Array.from(new Set(requested));

  for (const id of allowed) {
    if (!unique.includes(id)) {
      unique.push(id);
    }
  }

  return unique;
};

const sanitizeCanvasData = (
  value: unknown
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      "Invalid resume canvas data."
    );
  }

  let serialized = "";

  try {
    serialized =
      JSON.stringify(value);
  } catch {
    throw new Error(
      "Resume canvas data could not be saved."
    );
  }

  /*
   * Protect the API/database from accidentally receiving an
   * extremely large canvas document. This is intentionally
   * generous enough for a normal multi-page resume design.
   */
  if (
    serialized.length >
    4_000_000
  ) {
    throw new Error(
      "Resume design is too large. Remove some large elements or images."
    );
  }

  return serialized;
};

const getResumePayload = (
  body: Record<string, unknown>
) => {
  const title = cleanString(body.title, 255);

  if (!title) {
    throw new Error("Resume title is required.");
  }

  const requestedTemplate = cleanString(body.template, 50) || "classic";
  const template = allowedTemplates.has(requestedTemplate)
    ? requestedTemplate
    : "classic";

  const requestedAccent = cleanString(body.accent_color, 50) || "blue";
  const accentColor = allowedAccentColors.has(requestedAccent)
    ? requestedAccent
    : "blue";

  const requestedEditorMode =
    cleanString(body.editor_mode, 30) ||
    "builder";

  const editorMode =
    allowedEditorModes.has(requestedEditorMode)
      ? requestedEditorMode
      : "builder";

  const customSections = sanitizeCustomSections(body.custom_sections);
  const designSettings = sanitizeDesignSettings(body.design_settings);
  const sectionOrder = sanitizeSectionOrder(
    body.section_order,
    customSections
  );

  return {
    title,
    summary: cleanString(body.summary, 10000) || null,
    phone: cleanString(body.phone, 100) || null,
    location: cleanString(body.location, 255) || null,
    linkedinUrl: cleanString(body.linkedin_url, 500) || null,
    githubUrl: cleanString(body.github_url, 500) || null,
    portfolioUrl: cleanString(body.portfolio_url, 500) || null,
    skills: cleanString(body.skills, 10000) || null,
    experience: serializeArray(body.experience),
    education: serializeArray(body.education),
    projects: serializeArray(body.projects),
    template,
    accentColor,
    profileImage: validateProfileImage(body.profile_image),
    customSections: JSON.stringify(customSections),
    designSettings: JSON.stringify(designSettings),
    sectionOrder: JSON.stringify(sectionOrder),
    editorMode,
    canvasData: sanitizeCanvasData(body.canvas_data),
  };
};

const columns = `
  id,
  title,
  summary,
  phone,
  location,
  linkedin_url,
  github_url,
  portfolio_url,
  skills,
  experience,
  education,
  projects,
  template,
  accent_color,
  profile_image,
  custom_sections,
  design_settings,
  section_order,
  editor_mode,
  canvas_data,
  created_at,
  updated_at
`;

export const createResume = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const payload = getResumePayload(req.body || {});

    const [result]: any = await db.execute(
      `
        INSERT INTO resumes (
          user_id,
          title,
          summary,
          phone,
          location,
          linkedin_url,
          github_url,
          portfolio_url,
          skills,
          experience,
          education,
          projects,
          template,
          accent_color,
          profile_image,
          custom_sections,
          design_settings,
          section_order,
          editor_mode,
          canvas_data
        )
        VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?
        )
      `,
      [
        userId,
        payload.title,
        payload.summary,
        payload.phone,
        payload.location,
        payload.linkedinUrl,
        payload.githubUrl,
        payload.portfolioUrl,
        payload.skills,
        payload.experience,
        payload.education,
        payload.projects,
        payload.template,
        payload.accentColor,
        payload.profileImage,
        payload.customSections,
        payload.designSettings,
        payload.sectionOrder,
        payload.editorMode,
        payload.canvasData,
      ]
    );

    return res.status(201).json({
      message: "Resume created successfully",
      resumeId: result.insertId,
    });
  } catch (error) {
    console.error("Create resume error:", error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create resume",
    });
  }
};

export const getResumes = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const [rows] = await db.execute(
      `
        SELECT ${columns}
        FROM resumes
        WHERE user_id = ?
        ORDER BY updated_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      message: "Resumes fetched successfully",
      resumes: rows,
    });
  } catch (error) {
    console.error("Get resumes error:", error);

    return res.status(500).json({
      message: "Failed to fetch resumes",
    });
  }
};

export const getResumeById = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const resumeId = Number(req.params.id);

    if (!Number.isInteger(resumeId) || resumeId <= 0) {
      return res.status(400).json({
        message: "Invalid resume ID",
      });
    }

    const [rows]: any = await db.execute(
      `
        SELECT ${columns}
        FROM resumes
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
      `,
      [resumeId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      message: "Resume fetched successfully",
      resume: rows[0],
    });
  } catch (error) {
    console.error("Get resume error:", error);

    return res.status(500).json({
      message: "Failed to fetch resume",
    });
  }
};

export const updateResume = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const resumeId = Number(req.params.id);

    if (!Number.isInteger(resumeId) || resumeId <= 0) {
      return res.status(400).json({
        message: "Invalid resume ID",
      });
    }

    const payload = getResumePayload(req.body || {});

    const [result]: any = await db.execute(
      `
        UPDATE resumes
        SET
          title = ?,
          summary = ?,
          phone = ?,
          location = ?,
          linkedin_url = ?,
          github_url = ?,
          portfolio_url = ?,
          skills = ?,
          experience = ?,
          education = ?,
          projects = ?,
          template = ?,
          accent_color = ?,
          profile_image = ?,
          custom_sections = ?,
          design_settings = ?,
          section_order = ?,
          editor_mode = ?,
          canvas_data = ?
        WHERE id = ?
          AND user_id = ?
      `,
      [
        payload.title,
        payload.summary,
        payload.phone,
        payload.location,
        payload.linkedinUrl,
        payload.githubUrl,
        payload.portfolioUrl,
        payload.skills,
        payload.experience,
        payload.education,
        payload.projects,
        payload.template,
        payload.accentColor,
        payload.profileImage,
        payload.customSections,
        payload.designSettings,
        payload.sectionOrder,
        payload.editorMode,
        payload.canvasData,
        resumeId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      message: "Resume updated successfully",
    });
  } catch (error) {
    console.error("Update resume error:", error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to update resume",
    });
  }
};

export const deleteResume = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const resumeId = Number(req.params.id);

    if (!Number.isInteger(resumeId) || resumeId <= 0) {
      return res.status(400).json({
        message: "Invalid resume ID",
      });
    }

    const [result]: any = await db.execute(
      `
        DELETE FROM resumes
        WHERE id = ?
          AND user_id = ?
      `,
      [resumeId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);

    return res.status(500).json({
      message: "Failed to delete resume",
    });
  }
};