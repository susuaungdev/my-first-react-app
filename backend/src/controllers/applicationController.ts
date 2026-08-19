import {
  Request,
  Response,
} from "express";

import db from "../config/db";

/* =========================================================
   VALIDATION ERROR
========================================================= */

class ValidationError extends Error {}

/* =========================================================
   APPLICATION STATUSES
========================================================= */

const applicationStatuses =
  new Set([
    "Saved",
    "Applied",
    "Screening",
    "Interview",
    "Technical Interview",
    "Final Interview",
    "Offer",
    "Rejected",
    "Withdrawn",
  ]);

/* =========================================================
   TEXT VALIDATION
========================================================= */

const text = (
  value: unknown,
  label: string,
  max: number,
  required = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (required) {
      throw new ValidationError(
        `${label} is required`
      );
    }

    return "";
  }

  if (
    typeof value !== "string"
  ) {
    throw new ValidationError(
      `Invalid ${label.toLowerCase()}`
    );
  }

  const cleaned =
    value.trim();

  if (
    required &&
    !cleaned
  ) {
    throw new ValidationError(
      `${label} is required`
    );
  }

  if (
    cleaned.length >
    max
  ) {
    throw new ValidationError(
      `${label} is too long`
    );
  }

  return cleaned;
};

/* =========================================================
   HTTP URL VALIDATION
========================================================= */

const httpUrl = (
  value: unknown
) => {
  const cleaned =
    text(
      value,
      "Job URL",
      2048
    );

  if (!cleaned) {
    return "";
  }

  try {
    const parsed =
      new URL(
        cleaned
      );

    if (
      ![
        "http:",
        "https:",
      ].includes(
        parsed.protocol
      )
    ) {
      throw new Error();
    }
  } catch {
    throw new ValidationError(
      "Please enter a valid job URL"
    );
  }

  return cleaned;
};

/* =========================================================
   APPLICATION INPUT VALIDATION
========================================================= */

const validateApplicationInput = (
  body:
    Record<string, unknown> = {}
) => {
  const status =
    text(
      body.status,
      "Status",
      50
    ) ||
    "Saved";

  if (
    !applicationStatuses.has(
      status
    )
  ) {
    throw new ValidationError(
      "Invalid application status"
    );
  }

  const dateApplied =
    text(
      body.date_applied,
      "Application date",
      30
    );

  const deadline =
    text(
      body.deadline,
      "Deadline",
      30
    );

  if (
    dateApplied &&
    deadline &&
    deadline <
      dateApplied
  ) {
    throw new ValidationError(
      "Deadline cannot be earlier than the application date"
    );
  }

  return {
    company:
      text(
        body.company,
        "Company",
        200,
        true
      ),

    job_title:
      text(
        body.job_title,
        "Job title",
        200,
        true
      ),

    location:
      text(
        body.location,
        "Location",
        200
      ),

    job_url:
      httpUrl(
        body.job_url
      ),

    salary:
      text(
        body.salary,
        "Salary",
        100
      ),

    employment_type:
      text(
        body.employment_type,
        "Employment type",
        50
      ) ||
      "Full-time",

    description:
      text(
        body.description,
        "Description",
        10000
      ),

    date_applied:
      dateApplied,

    deadline,

    status,

    notes:
      text(
        body.notes,
        "Notes",
        10000
      ),

    contact_person:
      text(
        body.contact_person,
        "Contact person",
        200
      ),

    resume_id:
      body.resume_id,
  };
};

/* =========================================================
   VALIDATE RESUME OWNERSHIP
========================================================= */

const resolveResumeId =
  async (
    connection: any,
    resumeId:
      unknown,
    userId:
      number
  ): Promise<number | null> => {
    if (
      resumeId === undefined ||
      resumeId === null ||
      resumeId === ""
    ) {
      return null;
    }

    const parsedResumeId =
      Number(
        resumeId
      );

    if (
      !Number.isInteger(
        parsedResumeId
      ) ||
      parsedResumeId <=
        0
    ) {
      throw new ValidationError(
        "Invalid resume ID"
      );
    }

    const [
      resumeRows,
    ]: any =
      await connection.execute(
        `
          SELECT id

          FROM resumes

          WHERE
            id = ?
            AND user_id = ?

          LIMIT 1
        `,
        [
          parsedResumeId,
          userId,
        ]
      );

    if (
      resumeRows.length ===
      0
    ) {
      throw new ValidationError(
        "Selected resume does not exist or does not belong to you"
      );
    }

    return parsedResumeId;
  };

/* =========================================================
   CREATE APPLICATION
========================================================= */

export const createApplication =
  async (
    req: Request,
    res: Response
  ) => {
    const connection =
      await db.getConnection();

    try {
      const userId =
        req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Unauthorized",
          });
      }

      const {
        company,
        job_title,
        location,
        job_url,
        salary,
        employment_type,
        description,
        date_applied,
        deadline,
        status,
        notes,
        contact_person,
        resume_id,
      } =
        validateApplicationInput(
          req.body || {}
        );

      /* =====================================================
         VALIDATE RESUME
      ===================================================== */

      const selectedResumeId =
        await resolveResumeId(
          connection,
          resume_id,
          userId
        );

      /* =====================================================
         INITIAL STATUS
      ===================================================== */

      const initialStatus =
        status ||
        "Saved";

      /* =====================================================
         TRANSACTION
      ===================================================== */

      await connection.beginTransaction();

      /* =====================================================
         CREATE APPLICATION
      ===================================================== */

      const [
        result,
      ]: any =
        await connection.execute(
          `
            INSERT INTO applications (
              user_id,
              company,
              job_title,
              location,
              job_url,
              salary,
              employment_type,
              description,
              date_applied,
              deadline,
              status,
              notes,
              contact_person,
              resume_id
            )

            VALUES (
              ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?, ?
            )
          `,
          [
            userId,
            company,
            job_title,
            location ||
              null,
            job_url ||
              null,
            salary ||
              null,
            employment_type ||
              "Full-time",
            description ||
              null,
            date_applied ||
              null,
            deadline ||
              null,
            initialStatus,
            notes ||
              null,
            contact_person ||
              null,
            selectedResumeId,
          ]
        );

      const applicationId =
        result.insertId;

      /* =====================================================
         CREATE INITIAL STATUS HISTORY
      ===================================================== */

      await connection.execute(
        `
          INSERT INTO application_status_history (
            application_id,
            old_status,
            new_status,
            notes
          )

          VALUES (?, ?, ?, ?)
        `,
        [
          applicationId,
          null,
          initialStatus,
          "Application created",
        ]
      );

      await connection.commit();

      return res
        .status(201)
        .json({
          message:
            "Application created successfully",

          application: {
            id:
              applicationId,

            company,

            job_title,

            status:
              initialStatus,

            resume_id:
              selectedResumeId,
          },
        });
    } catch (error) {
      await connection.rollback();

      if (
        error instanceof
        ValidationError
      ) {
        return res
          .status(400)
          .json({
            message:
              error.message,
          });
      }

      console.error(
        "Create application error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to create application",
        });
    } finally {
      connection.release();
    }
  };

/* =========================================================
   GET ALL APPLICATIONS
========================================================= */

export const getApplications =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Unauthorized",
          });
      }

      const [
        rows,
      ] =
        await db.execute(
          `
            SELECT
              a.id,
              a.company,
              a.job_title,
              a.location,
              a.job_url,
              a.salary,
              a.employment_type,
              a.description,
              a.date_applied,
              a.deadline,
              a.status,
              a.notes,
              a.contact_person,
              a.resume_id,
              r.title AS resume_title,
              a.created_at,
              a.updated_at

            FROM applications a

            LEFT JOIN resumes r
              ON r.id =
                a.resume_id
              AND r.user_id =
                a.user_id

            WHERE
              a.user_id = ?

            ORDER BY
              a.created_at DESC
          `,
          [
            userId,
          ]
        );

      return res
        .status(200)
        .json({
          message:
            "Applications fetched successfully",

          applications:
            rows,
        });
    } catch (error) {
      console.error(
        "Get applications error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch applications",
        });
    }
  };

/* =========================================================
   GET ONE APPLICATION
========================================================= */

export const getApplicationById =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      const applicationId =
        Number(
          req.params.id
        );

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Unauthorized",
          });
      }

      if (
        !Number.isInteger(
          applicationId
        ) ||
        applicationId <=
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid application ID",
          });
      }

      const [
        rows,
      ]: any =
        await db.execute(
          `
            SELECT
              a.id,
              a.company,
              a.job_title,
              a.location,
              a.job_url,
              a.salary,
              a.employment_type,
              a.description,
              a.date_applied,
              a.deadline,
              a.status,
              a.notes,
              a.contact_person,
              a.resume_id,
              r.title AS resume_title,
              a.created_at,
              a.updated_at

            FROM applications a

            LEFT JOIN resumes r
              ON r.id =
                a.resume_id
              AND r.user_id =
                a.user_id

            WHERE
              a.id = ?
              AND a.user_id = ?

            LIMIT 1
          `,
          [
            applicationId,
            userId,
          ]
        );

      if (
        rows.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Application not found",
          });
      }

      return res
        .status(200)
        .json({
          message:
            "Application fetched successfully",

          application:
            rows[0],
        });
    } catch (error) {
      console.error(
        "Get application error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch application",
        });
    }
  };

/* =========================================================
   GET APPLICATION STATUS HISTORY
========================================================= */

export const getApplicationStatusHistory =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      const applicationId =
        Number(
          req.params.id
        );

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Unauthorized",
          });
      }

      if (
        !Number.isInteger(
          applicationId
        ) ||
        applicationId <=
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid application ID",
          });
      }

      /* =====================================================
         VERIFY OWNERSHIP
      ===================================================== */

      const [
        applicationRows,
      ]: any =
        await db.execute(
          `
            SELECT id

            FROM applications

            WHERE
              id = ?
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
        return res
          .status(404)
          .json({
            message:
              "Application not found",
          });
      }

      /* =====================================================
         LOAD HISTORY
      ===================================================== */

      const [
        historyRows,
      ] =
        await db.execute(
          `
            SELECT
              id,
              application_id,
              old_status,
              new_status,
              notes,
              changed_at

            FROM application_status_history

            WHERE
              application_id = ?

            ORDER BY
              changed_at ASC,
              id ASC
          `,
          [
            applicationId,
          ]
        );

      return res
        .status(200)
        .json({
          message:
            "Application status history fetched successfully",

          history:
            historyRows,
        });
    } catch (error) {
      console.error(
        "Get status history error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch application status history",
        });
    }
  };

/* =========================================================
   DELETE APPLICATION
========================================================= */

export const deleteApplication =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      const applicationId =
        Number(
          req.params.id
        );

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Unauthorized",
          });
      }

      if (
        !Number.isInteger(
          applicationId
        ) ||
        applicationId <=
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid application ID",
          });
      }

      const [
        result,
      ]: any =
        await db.execute(
          `
            DELETE FROM applications

            WHERE
              id = ?
              AND user_id = ?
          `,
          [
            applicationId,
            userId,
          ]
        );

      if (
        result.affectedRows ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Application not found",
          });
      }

      return res
        .status(200)
        .json({
          message:
            "Application deleted successfully",
        });
    } catch (error) {
      console.error(
        "Delete application error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to delete application",
        });
    }
  };

/* =========================================================
   UPDATE APPLICATION
========================================================= */

export const updateApplication =
  async (
    req: Request,
    res: Response
  ) => {
    const connection =
      await db.getConnection();

    try {
      const userId =
        req.user?.id;

      const applicationId =
        Number(
          req.params.id
        );

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Unauthorized",
          });
      }

      if (
        !Number.isInteger(
          applicationId
        ) ||
        applicationId <=
          0
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid application ID",
          });
      }

      const {
        company,
        job_title,
        location,
        job_url,
        salary,
        employment_type,
        description,
        date_applied,
        deadline,
        status,
        notes,
        contact_person,
        resume_id,
      } =
        validateApplicationInput(
          req.body || {}
        );

      /* =====================================================
         VALIDATE RESUME
      ===================================================== */

      const selectedResumeId =
        await resolveResumeId(
          connection,
          resume_id,
          userId
        );

      /* =====================================================
         START TRANSACTION
      ===================================================== */

      await connection.beginTransaction();

      /* =====================================================
         LOCK CURRENT APPLICATION
      ===================================================== */

      const [
        existingRows,
      ]: any =
        await connection.execute(
          `
            SELECT
              id,
              status

            FROM applications

            WHERE
              id = ?
              AND user_id = ?

            LIMIT 1

            FOR UPDATE
          `,
          [
            applicationId,
            userId,
          ]
        );

      if (
        existingRows.length ===
        0
      ) {
        await connection.rollback();

        return res
          .status(404)
          .json({
            message:
              "Application not found",
          });
      }

      const oldStatus =
        existingRows[0]
          .status;

      const newStatus =
        status ||
        "Saved";

      /* =====================================================
         UPDATE APPLICATION
      ===================================================== */

      const [
        result,
      ]: any =
        await connection.execute(
          `
            UPDATE applications

            SET
              company = ?,
              job_title = ?,
              location = ?,
              job_url = ?,
              salary = ?,
              employment_type = ?,
              description = ?,
              date_applied = ?,
              deadline = ?,
              status = ?,
              notes = ?,
              contact_person = ?,
              resume_id = ?

            WHERE
              id = ?
              AND user_id = ?
          `,
          [
            company,
            job_title,
            location ||
              null,
            job_url ||
              null,
            salary ||
              null,
            employment_type ||
              "Full-time",
            description ||
              null,
            date_applied ||
              null,
            deadline ||
              null,
            newStatus,
            notes ||
              null,
            contact_person ||
              null,
            selectedResumeId,
            applicationId,
            userId,
          ]
        );

      if (
        result.affectedRows ===
        0
      ) {
        await connection.rollback();

        return res
          .status(404)
          .json({
            message:
              "Application not found",
          });
      }

      /* =====================================================
         STATUS HISTORY
      ===================================================== */

      if (
        oldStatus !==
        newStatus
      ) {
        await connection.execute(
          `
            INSERT INTO application_status_history (
              application_id,
              old_status,
              new_status,
              notes
            )

            VALUES (?, ?, ?, ?)
          `,
          [
            applicationId,
            oldStatus,
            newStatus,
            null,
          ]
        );
      }

      await connection.commit();

      return res
        .status(200)
        .json({
          message:
            "Application updated successfully",

          statusChanged:
            oldStatus !==
            newStatus,

          previousStatus:
            oldStatus,

          currentStatus:
            newStatus,
        });
    } catch (error) {
      await connection.rollback();

      if (
        error instanceof
        ValidationError
      ) {
        return res
          .status(400)
          .json({
            message:
              error.message,
          });
      }

      console.error(
        "Update application error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to update application",
        });
    } finally {
      connection.release();
    }
  };