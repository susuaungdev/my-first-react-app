import { Request, Response } from "express";
import db from "../config/db";

/* =========================================================
   CREATE INTERVIEW
========================================================= */

export const createInterview = async (
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
      application_id,
      interview_type,
      scheduled_at,
      timezone,
      interviewer_name,
      interviewer_email,
      location,
      meeting_url,
      notes,
      preparation_notes,
      result,
      follow_up_date,
    } = req.body || {};

    if (!application_id) {
      return res.status(400).json({
        message: "Application is required",
      });
    }

    if (!interview_type) {
      return res.status(400).json({
        message: "Interview type is required",
      });
    }

    if (!scheduled_at) {
      return res.status(400).json({
        message: "Interview date and time are required",
      });
    }

    const applicationId =
      Number(application_id);

    if (
      Number.isNaN(applicationId) ||
      applicationId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    /* =====================================================
       VERIFY APPLICATION OWNERSHIP
    ===================================================== */

    const [applicationRows]: any =
      await db.execute(
        `
          SELECT id
          FROM applications
          WHERE id = ?
          AND user_id = ?
          LIMIT 1
        `,
        [
          applicationId,
          userId,
        ]
      );

    if (
      applicationRows.length === 0
    ) {
      return res.status(404).json({
        message:
          "Application not found",
      });
    }

    /* =====================================================
       CREATE INTERVIEW
    ===================================================== */

    const [insertResult]: any =
      await db.execute(
        `
          INSERT INTO interviews (
            user_id,
            application_id,
            interview_type,
            scheduled_at,
            timezone,
            interviewer_name,
            interviewer_email,
            location,
            meeting_url,
            notes,
            preparation_notes,
            result,
            follow_up_date
          )

          VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?
          )
        `,
        [
          userId,
          applicationId,
          interview_type.trim(),
          scheduled_at,
          timezone || null,
          interviewer_name || null,
          interviewer_email || null,
          location || null,
          meeting_url || null,
          notes || null,
          preparation_notes || null,
          result || null,
          follow_up_date || null,
        ]
      );

    return res.status(201).json({
      message:
        "Interview created successfully",

      interview: {
        id: insertResult.insertId,

        application_id:
          applicationId,

        interview_type:
          interview_type.trim(),

        scheduled_at,
      },
    });
  } catch (error) {
    console.error(
      "Create interview error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create interview",
    });
  }
};

/* =========================================================
   GET ALL INTERVIEWS FOR LOGGED-IN USER
========================================================= */

export const getInterviews = async (
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
            i.id,
            i.application_id,
            i.interview_type,
            i.scheduled_at,
            i.timezone,
            i.interviewer_name,
            i.interviewer_email,
            i.location,
            i.meeting_url,
            i.notes,
            i.preparation_notes,
            i.result,
            i.follow_up_date,
            i.created_at,
            i.updated_at,

            a.company,
            a.job_title,
            a.status AS application_status

          FROM interviews i

          INNER JOIN applications a
            ON a.id = i.application_id
            AND a.user_id = i.user_id

          WHERE i.user_id = ?

          ORDER BY
            i.scheduled_at ASC
        `,
        [userId]
      );

    return res.status(200).json({
      message:
        "Interviews fetched successfully",

      interviews: rows,
    });
  } catch (error) {
    console.error(
      "Get interviews error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch interviews",
    });
  }
};

/* =========================================================
   GET ONE INTERVIEW
========================================================= */

export const getInterviewById =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.user?.id;

      const interviewId =
        Number(req.params.id);

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      if (
        Number.isNaN(interviewId) ||
        interviewId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid interview ID",
        });
      }

      const [rows]: any =
        await db.execute(
          `
            SELECT
              i.id,
              i.application_id,
              i.interview_type,
              i.scheduled_at,
              i.timezone,
              i.interviewer_name,
              i.interviewer_email,
              i.location,
              i.meeting_url,
              i.notes,
              i.preparation_notes,
              i.result,
              i.follow_up_date,
              i.created_at,
              i.updated_at,

              a.company,
              a.job_title,
              a.status AS application_status

            FROM interviews i

            INNER JOIN applications a
              ON a.id = i.application_id
              AND a.user_id = i.user_id

            WHERE i.id = ?
            AND i.user_id = ?

            LIMIT 1
          `,
          [
            interviewId,
            userId,
          ]
        );

      if (
        rows.length === 0
      ) {
        return res.status(404).json({
          message:
            "Interview not found",
        });
      }

      return res.status(200).json({
        message:
          "Interview fetched successfully",

        interview:
          rows[0],
      });
    } catch (error) {
      console.error(
        "Get interview error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch interview",
      });
    }
  };

/* =========================================================
   GET INTERVIEWS FOR ONE APPLICATION
========================================================= */

export const getApplicationInterviews =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.user?.id;

      const applicationId =
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
        Number.isNaN(
          applicationId
        ) ||
        applicationId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid application ID",
        });
      }

      /* =====================================================
         VERIFY APPLICATION OWNERSHIP
      ===================================================== */

      const [applicationRows]: any =
        await db.execute(
          `
            SELECT id
            FROM applications
            WHERE id = ?
            AND user_id = ?
            LIMIT 1
          `,
          [
            applicationId,
            userId,
          ]
        );

      if (
        applicationRows.length ===
        0
      ) {
        return res.status(404).json({
          message:
            "Application not found",
        });
      }

      const [rows] =
        await db.execute(
          `
            SELECT
              id,
              application_id,
              interview_type,
              scheduled_at,
              timezone,
              interviewer_name,
              interviewer_email,
              location,
              meeting_url,
              notes,
              preparation_notes,
              result,
              follow_up_date,
              created_at,
              updated_at

            FROM interviews

            WHERE application_id = ?
            AND user_id = ?

            ORDER BY
              scheduled_at ASC
          `,
          [
            applicationId,
            userId,
          ]
        );

      return res.status(200).json({
        message:
          "Application interviews fetched successfully",

        interviews: rows,
      });
    } catch (error) {
      console.error(
        "Get application interviews error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch application interviews",
      });
    }
  };

/* =========================================================
   UPDATE INTERVIEW
========================================================= */

export const updateInterview =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.user?.id;

      const interviewId =
        Number(req.params.id);

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      if (
        Number.isNaN(interviewId) ||
        interviewId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid interview ID",
        });
      }

      const {
        interview_type,
        scheduled_at,
        timezone,
        interviewer_name,
        interviewer_email,
        location,
        meeting_url,
        notes,
        preparation_notes,
        result,
        follow_up_date,
      } = req.body || {};

      if (!interview_type) {
        return res.status(400).json({
          message:
            "Interview type is required",
        });
      }

      if (!scheduled_at) {
        return res.status(400).json({
          message:
            "Interview date and time are required",
        });
      }

      const [updateResult]: any =
        await db.execute(
          `
            UPDATE interviews

            SET
              interview_type = ?,
              scheduled_at = ?,
              timezone = ?,
              interviewer_name = ?,
              interviewer_email = ?,
              location = ?,
              meeting_url = ?,
              notes = ?,
              preparation_notes = ?,
              result = ?,
              follow_up_date = ?

            WHERE id = ?
            AND user_id = ?
          `,
          [
            interview_type.trim(),
            scheduled_at,
            timezone || null,
            interviewer_name || null,
            interviewer_email || null,
            location || null,
            meeting_url || null,
            notes || null,
            preparation_notes || null,
            result || null,
            follow_up_date || null,
            interviewId,
            userId,
          ]
        );

      if (
        updateResult.affectedRows ===
        0
      ) {
        return res.status(404).json({
          message:
            "Interview not found",
        });
      }

      return res.status(200).json({
        message:
          "Interview updated successfully",
      });
    } catch (error) {
      console.error(
        "Update interview error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update interview",
      });
    }
  };

/* =========================================================
   DELETE INTERVIEW
========================================================= */

export const deleteInterview =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.user?.id;

      const interviewId =
        Number(req.params.id);

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      if (
        Number.isNaN(interviewId) ||
        interviewId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid interview ID",
        });
      }

      const [deleteResult]: any =
        await db.execute(
          `
            DELETE FROM interviews
            WHERE id = ?
            AND user_id = ?
          `,
          [
            interviewId,
            userId,
          ]
        );

      if (
        deleteResult.affectedRows ===
        0
      ) {
        return res.status(404).json({
          message:
            "Interview not found",
        });
      }

      return res.status(200).json({
        message:
          "Interview deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete interview error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete interview",
      });
    }
  };