import { Request, Response } from "express";
import db from "../config/db";


// CREATE APPLICATION
export const createApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

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
      interview_date,
      contact_person,
    } = req.body || {};

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!company || !job_title) {
      return res.status(400).json({
        message: "Company and job title are required",
      });
    }

    const sql = `
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
        interview_date,
        contact_person
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result]: any = await db.execute(sql, [
      userId,
      company.trim(),
      job_title.trim(),
      location || null,
      job_url || null,
      salary || null,
      employment_type || "Full-time",
      description || null,
      date_applied || null,
      deadline || null,
      status || "Saved",
      notes || null,
      interview_date || null,
      contact_person || null,
    ]);

    return res.status(201).json({
      message: "Application created successfully",

      application: {
        id: result.insertId,
        company: company.trim(),
        job_title: job_title.trim(),
        status: status || "Saved",
      },
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to create application",
    });

  }
};


// GET ALL APPLICATIONS FOR LOGGED-IN USER
export const getApplications = async (
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
        SELECT
          id,
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
          interview_date,
          contact_person,
          created_at,
          updated_at
        FROM applications
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      message: "Applications fetched successfully",
      applications: rows,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch applications",
    });

  }
};

// GET ONE APPLICATION
export const getApplicationById = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const applicationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const [rows]: any = await db.execute(
      `
        SELECT
          id,
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
          interview_date,
          contact_person,
          created_at,
          updated_at
        FROM applications
        WHERE id = ?
        AND user_id = ?
      `,
      [
        applicationId,
        userId,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    return res.status(200).json({
      message: "Application fetched successfully",
      application: rows[0],
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch application",
    });

  }
};


// DELETE APPLICATION
export const deleteApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const applicationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const [result]: any = await db.execute(
      `
        DELETE FROM applications
        WHERE id = ?
        AND user_id = ?
      `,
      [
        applicationId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    return res.status(200).json({
      message: "Application deleted successfully",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to delete application",
    });

  }
};

// UPDATE APPLICATION
export const updateApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const applicationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
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
      interview_date,
      contact_person,
    } = req.body || {};

    if (!company || !job_title) {
      return res.status(400).json({
        message: "Company and job title are required",
      });
    }

    const [result]: any = await db.execute(
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
          interview_date = ?,
          contact_person = ?
        WHERE id = ?
        AND user_id = ?
      `,
      [
        company.trim(),
        job_title.trim(),
        location || null,
        job_url || null,
        salary || null,
        employment_type || "Full-time",
        description || null,
        date_applied || null,
        deadline || null,
        status || "Saved",
        notes || null,
        interview_date || null,
        contact_person || null,
        applicationId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    return res.status(200).json({
      message: "Application updated successfully",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to update application",
    });

  }
};