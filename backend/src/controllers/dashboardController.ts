import { Request, Response } from "express";
import db from "../config/db";

export const getDashboardSummary = async (
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

    // Application statistics
    const [statsRows]: any = await db.execute(
      `
        SELECT
          COUNT(*) AS totalApplications,

          SUM(
            CASE
              WHEN status IN (
                'Interview',
                'Technical Interview',
                'Final Interview'
              )
              THEN 1
              ELSE 0
            END
          ) AS interviews,

          SUM(
            CASE
              WHEN status = 'Offer'
              THEN 1
              ELSE 0
            END
          ) AS offers

        FROM applications
        WHERE user_id = ?
      `,
      [userId]
    );

    // Latest five applications
    const [recentApplications]: any = await db.execute(
      `
        SELECT
          id,
          company,
          job_title,
          status,
          location,
          date_applied,
          created_at

        FROM applications

        WHERE user_id = ?

        ORDER BY created_at DESC

        LIMIT 5
      `,
      [userId]
    );

    const stats = statsRows[0];

    return res.status(200).json({
      message: "Dashboard summary fetched successfully",

      summary: {
        totalApplications: Number(
          stats.totalApplications || 0
        ),

        interviews: Number(
          stats.interviews || 0
        ),

        offers: Number(
          stats.offers || 0
        ),

        resumes: 0,
      },

      recentApplications,
    });

  } catch (error) {

    console.error(
      "Dashboard summary error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch dashboard summary",
    });

  }
};