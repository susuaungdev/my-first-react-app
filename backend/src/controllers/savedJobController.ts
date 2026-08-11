import { Request, Response } from "express";
import db from "../config/db";

/* =========================================================
   CREATE SAVED JOB
========================================================= */

export const createSavedJob = async (
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
      company,
      job_title,
      location,
      salary,
      employment_type,
      job_url,
      description,
      deadline,
      notes,
    } = req.body || {};

    if (
      !company?.trim() ||
      !job_title?.trim()
    ) {
      return res.status(400).json({
        message:
          "Company and job title are required",
      });
    }

    const [insertResult]: any =
      await db.execute(
        `
          INSERT INTO saved_jobs (
            user_id,
            company,
            job_title,
            location,
            salary,
            employment_type,
            job_url,
            description,
            deadline,
            notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          company.trim(),
          job_title.trim(),
          location?.trim() || null,
          salary?.trim() || null,
          employment_type?.trim() || null,
          job_url?.trim() || null,
          description?.trim() || null,
          deadline || null,
          notes?.trim() || null,
        ]
      );

    const [rows]: any =
      await db.execute(
        `
          SELECT
            id,
            company,
            job_title,
            location,
            salary,
            employment_type,
            job_url,
            description,
            deadline,
            notes,
            saved_at,
            created_at,
            updated_at
          FROM saved_jobs
          WHERE id = ?
          AND user_id = ?
          LIMIT 1
        `,
        [
          insertResult.insertId,
          userId,
        ]
      );

    return res.status(201).json({
      message:
        "Saved job created successfully",

      savedJob:
        rows[0],
    });
  } catch (error) {
    console.error(
      "Create saved job error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create saved job",
    });
  }
};

/* =========================================================
   GET ALL SAVED JOBS
========================================================= */

export const getSavedJobs = async (
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

    const [rows] =
      await db.execute(
        `
          SELECT
            id,
            company,
            job_title,
            location,
            salary,
            employment_type,
            job_url,
            description,
            deadline,
            notes,
            saved_at,
            created_at,
            updated_at
          FROM saved_jobs
          WHERE user_id = ?
          ORDER BY
            saved_at DESC,
            id DESC
        `,
        [userId]
      );

    return res.status(200).json({
      message:
        "Saved jobs fetched successfully",

      savedJobs:
        rows,
    });
  } catch (error) {
    console.error(
      "Get saved jobs error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch saved jobs",
    });
  }
};

/* =========================================================
   GET ONE SAVED JOB
========================================================= */

export const getSavedJobById =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      const savedJobId =
        Number(
          req.params.id
        );

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      if (
        !Number.isInteger(
          savedJobId
        ) ||
        savedJobId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid saved job ID",
        });
      }

      const [rows]: any =
        await db.execute(
          `
            SELECT
              id,
              company,
              job_title,
              location,
              salary,
              employment_type,
              job_url,
              description,
              deadline,
              notes,
              saved_at,
              created_at,
              updated_at
            FROM saved_jobs
            WHERE id = ?
            AND user_id = ?
            LIMIT 1
          `,
          [
            savedJobId,
            userId,
          ]
        );

      if (
        rows.length === 0
      ) {
        return res.status(404).json({
          message:
            "Saved job not found",
        });
      }

      return res.status(200).json({
        message:
          "Saved job fetched successfully",

        savedJob:
          rows[0],
      });
    } catch (error) {
      console.error(
        "Get saved job error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch saved job",
      });
    }
  };

/* =========================================================
   UPDATE SAVED JOB
========================================================= */

export const updateSavedJob =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      const savedJobId =
        Number(
          req.params.id
        );

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      if (
        !Number.isInteger(
          savedJobId
        ) ||
        savedJobId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid saved job ID",
        });
      }

      const {
        company,
        job_title,
        location,
        salary,
        employment_type,
        job_url,
        description,
        deadline,
        notes,
      } = req.body || {};

      if (
        !company?.trim() ||
        !job_title?.trim()
      ) {
        return res.status(400).json({
          message:
            "Company and job title are required",
        });
      }

      /* VERIFY JOB EXISTS AND BELONGS TO USER */

      const [existingRows]: any =
        await db.execute(
          `
            SELECT id
            FROM saved_jobs
            WHERE id = ?
            AND user_id = ?
            LIMIT 1
          `,
          [
            savedJobId,
            userId,
          ]
        );

      if (
        existingRows.length ===
        0
      ) {
        return res.status(404).json({
          message:
            "Saved job not found",
        });
      }

      /* UPDATE */

      await db.execute(
        `
          UPDATE saved_jobs
          SET
            company = ?,
            job_title = ?,
            location = ?,
            salary = ?,
            employment_type = ?,
            job_url = ?,
            description = ?,
            deadline = ?,
            notes = ?
          WHERE id = ?
          AND user_id = ?
        `,
        [
          company.trim(),
          job_title.trim(),
          location?.trim() || null,
          salary?.trim() || null,
          employment_type?.trim() || null,
          job_url?.trim() || null,
          description?.trim() || null,
          deadline || null,
          notes?.trim() || null,
          savedJobId,
          userId,
        ]
      );

      /* RETURN FULL UPDATED JOB */

      const [updatedRows]: any =
        await db.execute(
          `
            SELECT
              id,
              company,
              job_title,
              location,
              salary,
              employment_type,
              job_url,
              description,
              deadline,
              notes,
              saved_at,
              created_at,
              updated_at
            FROM saved_jobs
            WHERE id = ?
            AND user_id = ?
            LIMIT 1
          `,
          [
            savedJobId,
            userId,
          ]
        );

      return res.status(200).json({
        message:
          "Saved job updated successfully",

        savedJob:
          updatedRows[0],
      });
    } catch (error) {
      console.error(
        "Update saved job error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update saved job",
      });
    }
  };

/* =========================================================
   DELETE SAVED JOB
========================================================= */

export const deleteSavedJob =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      const savedJobId =
        Number(
          req.params.id
        );

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      if (
        !Number.isInteger(
          savedJobId
        ) ||
        savedJobId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid saved job ID",
        });
      }

      const [deleteResult]: any =
        await db.execute(
          `
            DELETE FROM saved_jobs
            WHERE id = ?
            AND user_id = ?
          `,
          [
            savedJobId,
            userId,
          ]
        );

      if (
        deleteResult.affectedRows ===
        0
      ) {
        return res.status(404).json({
          message:
            "Saved job not found",
        });
      }

      return res.status(200).json({
        message:
          "Saved job deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete saved job error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete saved job",
      });
    }
  };