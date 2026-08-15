import { Request, Response } from "express";
import db from "../config/db";

class ValidationError extends Error {}

const interviewResults = new Set(["Pending", "Passed", "Failed", "Offer", "Cancelled"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown, label: string, max: number, required = false) => {
  if (value === undefined || value === null || value === "") {
    if (required) throw new ValidationError(`${label} is required`);
    return "";
  }
  if (typeof value !== "string") throw new ValidationError(`Invalid ${label.toLowerCase()}`);
  const cleaned = value.trim();
  if (required && !cleaned) throw new ValidationError(`${label} is required`);
  if (cleaned.length > max) throw new ValidationError(`${label} is too long`);
  return cleaned;
};

const validateInterviewInput = (body: Record<string, unknown> = {}, includeApplication = false) => {
  const interviewerEmail = text(body.interviewer_email, "Interviewer email", 254);
  if (interviewerEmail && !emailPattern.test(interviewerEmail)) {
    throw new ValidationError("Please enter a valid interviewer email");
  }
  const meetingUrl = text(body.meeting_url, "Meeting URL", 2048);
  if (meetingUrl) {
    try {
      const parsed = new URL(meetingUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch { throw new ValidationError("Please enter a valid meeting URL"); }
  }
  const scheduledAt = text(body.scheduled_at, "Interview date and time", 40, true);
  const followUpDate = text(body.follow_up_date, "Follow-up date", 40);
  if (followUpDate && followUpDate < scheduledAt) {
    throw new ValidationError("Follow-up date cannot be earlier than the interview date");
  }
  const result = text(body.result, "Interview result", 30) || "Pending";
  if (!interviewResults.has(result)) throw new ValidationError("Invalid interview result");
  return {
    application_id: includeApplication ? body.application_id : undefined,
    interview_type: text(body.interview_type, "Interview type", 100, true),
    scheduled_at: scheduledAt,
    timezone: text(body.timezone, "Timezone", 100),
    interviewer_name: text(body.interviewer_name, "Interviewer name", 200),
    interviewer_email: interviewerEmail,
    location: text(body.location, "Location", 300),
    meeting_url: meetingUrl,
    notes: text(body.notes, "Notes", 10000),
    preparation_notes: text(body.preparation_notes, "Preparation notes", 10000),
    result,
    follow_up_date: followUpDate,
  };
};

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
    } = validateInterviewInput(req.body || {}, true);

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
      !Number.isInteger(applicationId) ||
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
          interview_type,
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

          interview_type,

        scheduled_at,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
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
        !Number.isInteger(interviewId) ||
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
        !Number.isInteger(applicationId) ||
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
        !Number.isInteger(interviewId) ||
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
      } = validateInterviewInput(req.body || {});

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
            interview_type,
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
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
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
        !Number.isInteger(interviewId) ||
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