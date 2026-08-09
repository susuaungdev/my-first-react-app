import { Request, Response } from "express";
import db from "../config/db";

/* =========================================================
   CREATE RESUME
========================================================= */

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

    const {
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
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Resume title is required",
      });
    }

    const selectedTemplate =
      template || "classic";

    const selectedAccentColor =
      accent_color || "blue";

    const [result]: any =
      await db.execute(
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
            accent_color
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
          )
        `,
        [
          userId,
          title.trim(),
          summary || null,
          phone || null,
          location || null,
          linkedin_url || null,
          github_url || null,
          portfolio_url || null,
          skills || null,

          experience
            ? JSON.stringify(experience)
            : null,

          education
            ? JSON.stringify(education)
            : null,

          projects
            ? JSON.stringify(projects)
            : null,

          selectedTemplate,
          selectedAccentColor,
        ]
      );

    return res.status(201).json({
      message:
        "Resume created successfully",

      resumeId:
        result.insertId,
    });
  } catch (error) {
    console.error(
      "Create resume error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create resume",
    });
  }
};

/* =========================================================
   GET ALL RESUMES
========================================================= */

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

    const [rows]: any =
      await db.execute(
        `
          SELECT
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
            created_at,
            updated_at
          FROM resumes
          WHERE user_id = ?
          ORDER BY updated_at DESC
        `,
        [userId]
      );

    return res.status(200).json({
      message:
        "Resumes fetched successfully",

      resumes: rows,
    });
  } catch (error) {
    console.error(
      "Get resumes error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch resumes",
    });
  }
};

/* =========================================================
   GET ONE RESUME
========================================================= */

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

    const resumeId =
      Number(req.params.id);

    if (
      Number.isNaN(resumeId) ||
      resumeId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid resume ID",
      });
    }

    const [rows]: any =
      await db.execute(
        `
          SELECT
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
            created_at,
            updated_at
          FROM resumes
          WHERE id = ?
            AND user_id = ?
          LIMIT 1
        `,
        [
          resumeId,
          userId,
        ]
      );

    if (rows.length === 0) {
      return res.status(404).json({
        message:
          "Resume not found",
      });
    }

    return res.status(200).json({
      message:
        "Resume fetched successfully",

      resume:
        rows[0],
    });
  } catch (error) {
    console.error(
      "Get resume error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch resume",
    });
  }
};

/* =========================================================
   UPDATE RESUME
========================================================= */

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

    const resumeId =
      Number(req.params.id);

    if (
      Number.isNaN(resumeId) ||
      resumeId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid resume ID",
      });
    }

    const {
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
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message:
          "Resume title is required",
      });
    }

    const selectedTemplate =
      template || "classic";

    const selectedAccentColor =
      accent_color || "blue";

    const [result]: any =
      await db.execute(
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
            accent_color = ?
          WHERE id = ?
            AND user_id = ?
        `,
        [
          title.trim(),
          summary || null,
          phone || null,
          location || null,
          linkedin_url || null,
          github_url || null,
          portfolio_url || null,
          skills || null,

          experience
            ? JSON.stringify(experience)
            : null,

          education
            ? JSON.stringify(education)
            : null,

          projects
            ? JSON.stringify(projects)
            : null,

          selectedTemplate,
          selectedAccentColor,

          resumeId,
          userId,
        ]
      );

    if (
      result.affectedRows === 0
    ) {
      return res.status(404).json({
        message:
          "Resume not found",
      });
    }

    return res.status(200).json({
      message:
        "Resume updated successfully",
    });
  } catch (error) {
    console.error(
      "Update resume error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update resume",
    });
  }
};

/* =========================================================
   DELETE RESUME
========================================================= */

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

    const resumeId =
      Number(req.params.id);

    if (
      Number.isNaN(resumeId) ||
      resumeId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid resume ID",
      });
    }

    const [result]: any =
      await db.execute(
        `
          DELETE FROM resumes
          WHERE id = ?
            AND user_id = ?
        `,
        [
          resumeId,
          userId,
        ]
      );

    if (
      result.affectedRows === 0
    ) {
      return res.status(404).json({
        message:
          "Resume not found",
      });
    }

    return res.status(200).json({
      message:
        "Resume deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete resume error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete resume",
    });
  }
};