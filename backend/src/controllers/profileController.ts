import {
  Request,
  Response,
} from "express";

import db from "../config/db";


// ===============================
// GET PROFILE
// ===============================

export const getProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const [rows]: any =
      await db.execute(
        `
          SELECT
            p.id,
            p.user_id,
            p.profile_picture,

            u.name,
            u.email,

            p.phone,
            p.location,
            p.professional_title,
            p.bio,
            p.skills,
            p.experience_level,

            p.linkedin_url,
            p.github_url,
            p.portfolio_url,

            p.created_at,
            p.updated_at

          FROM users u

          LEFT JOIN profiles p
            ON p.user_id = u.id

          WHERE u.id = ?
        `,
        [userId]
      );

    if (
      rows.length === 0
    ) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      message:
        "Profile fetched successfully",

      profile:
        rows[0],
    });

  } catch (error) {

    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch profile",
    });

  }
};


// ===============================
// CREATE / UPDATE PROFILE
// ===============================

export const saveProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      phone,
      location,
      professional_title,
      bio,
      skills,
      experience_level,
      linkedin_url,
      github_url,
      portfolio_url,
    } = req.body || {};


    // Existing profile picture
    const [existingRows]: any =
      await db.execute(
        `
          SELECT profile_picture
          FROM profiles
          WHERE user_id = ?
        `,
        [userId]
      );


    let profilePicture =
      existingRows.length > 0
        ? existingRows[0]
            .profile_picture
        : null;


    // New uploaded picture
    if (req.file) {
      profilePicture =
        `/uploads/${req.file.filename}`;
    }


    const sql = `
      INSERT INTO profiles (
        user_id,
        profile_picture,
        phone,
        location,
        professional_title,
        bio,
        skills,
        experience_level,
        linkedin_url,
        github_url,
        portfolio_url
      )

      VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )

      ON DUPLICATE KEY UPDATE

        profile_picture =
          VALUES(profile_picture),

        phone =
          VALUES(phone),

        location =
          VALUES(location),

        professional_title =
          VALUES(professional_title),

        bio =
          VALUES(bio),

        skills =
          VALUES(skills),

        experience_level =
          VALUES(experience_level),

        linkedin_url =
          VALUES(linkedin_url),

        github_url =
          VALUES(github_url),

        portfolio_url =
          VALUES(portfolio_url)
    `;


    await db.execute(
      sql,
      [
        userId,
        profilePicture,

        phone || null,
        location || null,

        professional_title ||
          null,

        bio || null,
        skills || null,

        experience_level ||
          null,

        linkedin_url ||
          null,

        github_url ||
          null,

        portfolio_url ||
          null,
      ]
    );


    return res.status(200).json({
      message:
        "Profile saved successfully",
    });

  } catch (error) {

    console.error(
      "Save profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to save profile",
    });

  }
};