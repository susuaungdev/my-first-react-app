import {
  Request,
  Response,
} from "express";

import db from "../config/db";

/* =========================================================
   ANALYTICS OVERVIEW
========================================================= */

export const getAnalyticsOverview =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      /* =====================================================
         APPLICATION COUNTS
      ===================================================== */

      const [
        applicationRows,
      ]: any =
        await db.execute(
          `
            SELECT
              COUNT(*) AS total,

              SUM(
                CASE
                  WHEN status = 'Saved'
                  THEN 1
                  ELSE 0
                END
              ) AS saved,

              SUM(
                CASE
                  WHEN status = 'Applied'
                  THEN 1
                  ELSE 0
                END
              ) AS applied,

              SUM(
                CASE
                  WHEN status = 'Screening'
                  THEN 1
                  ELSE 0
                END
              ) AS screening,

              SUM(
                CASE
                  WHEN status LIKE '%Interview%'
                  THEN 1
                  ELSE 0
                END
              ) AS interview,

              SUM(
                CASE
                  WHEN status = 'Offer'
                  THEN 1
                  ELSE 0
                END
              ) AS offers,

              SUM(
                CASE
                  WHEN status = 'Rejected'
                  THEN 1
                  ELSE 0
                END
              ) AS rejected,

              SUM(
                CASE
                  WHEN status = 'Withdrawn'
                  THEN 1
                  ELSE 0
                END
              ) AS withdrawn

            FROM applications

            WHERE user_id = ?
          `,
          [
            userId,
          ]
        );

      const applicationStats =
        applicationRows[0] || {};

      /* =====================================================
         INTERVIEW COUNTS
      ===================================================== */

      const [
        interviewRows,
      ]: any =
        await db.execute(
          `
            SELECT
              COUNT(*) AS total,

              SUM(
                CASE
                  WHEN i.result IS NULL
                    OR i.result = 'Pending'
                  THEN 1
                  ELSE 0
                END
              ) AS pending,

              SUM(
                CASE
                  WHEN i.result = 'Passed'
                  THEN 1
                  ELSE 0
                END
              ) AS passed,

              SUM(
                CASE
                  WHEN i.result = 'Failed'
                  THEN 1
                  ELSE 0
                END
              ) AS failed,

              SUM(
                CASE
                  WHEN i.result = 'Offer'
                  THEN 1
                  ELSE 0
                END
              ) AS offers,

              SUM(
                CASE
                  WHEN i.result = 'Cancelled'
                  THEN 1
                  ELSE 0
                END
              ) AS cancelled

            FROM interviews i

            INNER JOIN applications a
              ON a.id = i.application_id

            WHERE a.user_id = ?
          `,
          [
            userId,
          ]
        );

      const interviewStats =
        interviewRows[0] || {};

      /* =====================================================
         SAVED JOB COUNTS
      ===================================================== */

      const [
        savedJobRows,
      ]: any =
        await db.execute(
          `
            SELECT
              COUNT(*) AS total,

              SUM(
                CASE
                  WHEN deadline IS NULL
                  THEN 1
                  ELSE 0
                END
              ) AS no_deadline,

              SUM(
                CASE
                  WHEN deadline IS NOT NULL
                    AND deadline < CURDATE()
                  THEN 1
                  ELSE 0
                END
              ) AS expired,

              SUM(
                CASE
                  WHEN deadline IS NOT NULL
                    AND deadline >= CURDATE()
                    AND deadline <= DATE_ADD(
                      CURDATE(),
                      INTERVAL 7 DAY
                    )
                  THEN 1
                  ELSE 0
                END
              ) AS next_7_days

            FROM saved_jobs

            WHERE user_id = ?
          `,
          [
            userId,
          ]
        );

      const savedJobStats =
        savedJobRows[0] || {};

      /* =====================================================
         UPCOMING INTERVIEWS
      ===================================================== */

      const [
        upcomingInterviewRows,
      ]: any =
        await db.execute(
          `
            SELECT
              i.id,
              i.application_id,
              i.interview_type,
              i.scheduled_at,
              i.timezone,
              i.interviewer_name,
              i.location,
              i.meeting_url,
              i.result,
              a.company,
              a.job_title

            FROM interviews i

            INNER JOIN applications a
              ON a.id = i.application_id

            WHERE a.user_id = ?
              AND i.scheduled_at >= NOW()

            ORDER BY
              i.scheduled_at ASC

            LIMIT 5
          `,
          [
            userId,
          ]
        );

      /* =====================================================
         RECENT APPLICATIONS
      ===================================================== */

      const [
        recentApplicationRows,
      ]: any =
        await db.execute(
          `
            SELECT
              id,
              company,
              job_title,
              status,
              date_applied,
              created_at,
              updated_at

            FROM applications

            WHERE user_id = ?

            ORDER BY
              updated_at DESC,
              created_at DESC

            LIMIT 5
          `,
          [
            userId,
          ]
        );

      /* =====================================================
         APPLICATION STATUS DISTRIBUTION
      ===================================================== */

      const [
        applicationStatusRows,
      ]: any =
        await db.execute(
          `
            SELECT
              status,
              COUNT(*) AS count

            FROM applications

            WHERE user_id = ?

            GROUP BY status

            ORDER BY count DESC
          `,
          [
            userId,
          ]
        );

      /* =====================================================
         INTERVIEW RESULT DISTRIBUTION
      ===================================================== */

      const [
        interviewResultRows,
      ]: any =
        await db.execute(
          `
            SELECT
              COALESCE(
                i.result,
                'Pending'
              ) AS result,

              COUNT(*) AS count

            FROM interviews i

            INNER JOIN applications a
              ON a.id = i.application_id

            WHERE a.user_id = ?

            GROUP BY
              COALESCE(
                i.result,
                'Pending'
              )

            ORDER BY count DESC
          `,
          [
            userId,
          ]
        );

      /* =====================================================
         APPLICATIONS BY MONTH
      ===================================================== */

      const [
        applicationsByMonthRows,
      ]: any =
        await db.execute(
          `
            SELECT
              DATE_FORMAT(
                created_at,
                '%Y-%m'
              ) AS month,

              COUNT(*) AS count

            FROM applications

            WHERE user_id = ?
              AND created_at >= DATE_SUB(
                CURDATE(),
                INTERVAL 6 MONTH
              )

            GROUP BY
              DATE_FORMAT(
                created_at,
                '%Y-%m'
              )

            ORDER BY month ASC
          `,
          [
            userId,
          ]
        );

      /* =====================================================
         RATES
      ===================================================== */

      const totalApplications =
        Number(
          applicationStats.total ||
            0
        );

      const interviewApplications =
        Number(
          applicationStats.interview ||
            0
        );

      const offers =
        Number(
          applicationStats.offers ||
            0
        );

      const rejected =
        Number(
          applicationStats.rejected ||
            0
        );

      const interviewRate =
        totalApplications > 0
          ? Number(
              (
                (
                  interviewApplications /
                  totalApplications
                ) *
                100
              ).toFixed(1)
            )
          : 0;

      const offerRate =
        totalApplications > 0
          ? Number(
              (
                (
                  offers /
                  totalApplications
                ) *
                100
              ).toFixed(1)
            )
          : 0;

      const rejectionRate =
        totalApplications > 0
          ? Number(
              (
                (
                  rejected /
                  totalApplications
                ) *
                100
              ).toFixed(1)
            )
          : 0;

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.status(200).json({
        message:
          "Analytics fetched successfully",

        applications: {
          total:
            Number(
              applicationStats.total ||
                0
            ),

          saved:
            Number(
              applicationStats.saved ||
                0
            ),

          applied:
            Number(
              applicationStats.applied ||
                0
            ),

          screening:
            Number(
              applicationStats.screening ||
                0
            ),

          interview:
            Number(
              applicationStats.interview ||
                0
            ),

          offers:
            Number(
              applicationStats.offers ||
                0
            ),

          rejected:
            Number(
              applicationStats.rejected ||
                0
            ),

          withdrawn:
            Number(
              applicationStats.withdrawn ||
                0
            ),
        },

        interviews: {
          total:
            Number(
              interviewStats.total ||
                0
            ),

          pending:
            Number(
              interviewStats.pending ||
                0
            ),

          passed:
            Number(
              interviewStats.passed ||
                0
            ),

          failed:
            Number(
              interviewStats.failed ||
                0
            ),

          offers:
            Number(
              interviewStats.offers ||
                0
            ),

          cancelled:
            Number(
              interviewStats.cancelled ||
                0
            ),
        },

        savedJobs: {
          total:
            Number(
              savedJobStats.total ||
                0
            ),

          noDeadline:
            Number(
              savedJobStats.no_deadline ||
                0
            ),

          expired:
            Number(
              savedJobStats.expired ||
                0
            ),

          next7Days:
            Number(
              savedJobStats.next_7_days ||
                0
            ),
        },

        rates: {
          interviewRate,
          offerRate,
          rejectionRate,
        },

        applicationStatusDistribution:
          applicationStatusRows.map(
            (
              row: any
            ) => ({
              status:
                row.status,

              count:
                Number(
                  row.count ||
                    0
                ),
            })
          ),

        interviewResultDistribution:
          interviewResultRows.map(
            (
              row: any
            ) => ({
              result:
                row.result,

              count:
                Number(
                  row.count ||
                    0
                ),
            })
          ),

        applicationsByMonth:
          applicationsByMonthRows.map(
            (
              row: any
            ) => ({
              month:
                row.month,

              count:
                Number(
                  row.count ||
                    0
                ),
            })
          ),

        upcomingInterviews:
          upcomingInterviewRows,

        recentApplications:
          recentApplicationRows,
      });
    } catch (error) {
      console.error(
        "Analytics overview error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch analytics",
      });
    }
  };