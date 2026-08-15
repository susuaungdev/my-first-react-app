import { type Request, type Response } from "express";
import fs from "fs/promises";
import path from "path";
import type { RowDataPacket } from "mysql2";
import db from "../config/db";
import { uploadDirectory } from "../middleware/uploadMiddleware";

type ProfilePictureRow = RowDataPacket & {
  profile_picture: string | null;
};

const optionalText = (value: unknown, max: number) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_PROFILE_DATA");
  const cleaned = value.trim();
  if (cleaned.length > max) throw new Error("PROFILE_FIELD_TOO_LONG");
  return cleaned || null;
};

const optionalUrl = (value: unknown) => {
  const cleaned = optionalText(value, 2048);
  if (!cleaned) return null;

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    throw new Error("INVALID_PROFILE_URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("INVALID_PROFILE_URL");
  }

  return cleaned;
};

const deleteUploadedFile = async (publicPath: string | null | undefined) => {
  if (!publicPath?.startsWith("/uploads/")) return;
  const filename = path.basename(publicPath);
  const absolutePath = path.join(uploadDirectory, filename);

  try {
    await fs.unlink(absolutePath);
  } catch (error: unknown) {
    if (
      !(
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      )
    ) {
      console.error("Failed to remove profile image:", error);
    }
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT p.id, p.user_id, p.profile_picture, u.name, u.email,
        p.phone, p.location, p.professional_title, p.bio, p.skills,
        p.experience_level, p.linkedin_url, p.github_url, p.portfolio_url,
        p.created_at, p.updated_at
       FROM users u LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (!rows[0]) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      profile: rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const saveProfile = async (req: Request, res: Response) => {
  const newPicturePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const userId = req.user?.id;
    if (!userId) {
      await deleteUploadedFile(newPicturePath);
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const [existingRows] = await db.execute<ProfilePictureRow[]>(
      "SELECT profile_picture FROM profiles WHERE user_id = ? LIMIT 1",
      [userId]
    );

    const oldPicturePath = existingRows[0]?.profile_picture || null;
    const profilePicture = newPicturePath || oldPicturePath;

    const phone = optionalText(req.body?.phone, 50);
    const location = optionalText(req.body?.location, 150);
    const professionalTitle = optionalText(req.body?.professional_title, 150);
    const bio = optionalText(req.body?.bio, 5000);
    const skills = optionalText(req.body?.skills, 3000);
    const experienceLevel = optionalText(req.body?.experience_level, 100);
    const linkedinUrl = optionalUrl(req.body?.linkedin_url);
    const githubUrl = optionalUrl(req.body?.github_url);
    const portfolioUrl = optionalUrl(req.body?.portfolio_url);

    await db.execute(
      `INSERT INTO profiles
       (user_id, profile_picture, phone, location, professional_title, bio,
        skills, experience_level, linkedin_url, github_url, portfolio_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE profile_picture = VALUES(profile_picture),
        phone = VALUES(phone), location = VALUES(location),
        professional_title = VALUES(professional_title), bio = VALUES(bio),
        skills = VALUES(skills), experience_level = VALUES(experience_level),
        linkedin_url = VALUES(linkedin_url), github_url = VALUES(github_url),
        portfolio_url = VALUES(portfolio_url)`,
      [
        userId, profilePicture, phone, location, professionalTitle, bio,
        skills, experienceLevel, linkedinUrl, githubUrl, portfolioUrl,
      ]
    );

    if (newPicturePath && oldPicturePath && oldPicturePath !== newPicturePath) {
      await deleteUploadedFile(oldPicturePath);
    }

    res.status(200).json({ message: "Profile saved successfully" });
  } catch (error) {
    await deleteUploadedFile(newPicturePath);
    console.error("Save profile error:", error);

    const message =
      error instanceof Error && error.message === "INVALID_PROFILE_URL"
        ? "LinkedIn, GitHub, and portfolio links must be valid HTTP or HTTPS URLs."
        : error instanceof Error && error.message === "PROFILE_FIELD_TOO_LONG"
        ? "One or more profile fields are too long."
        : error instanceof Error && error.message === "INVALID_PROFILE_DATA"
        ? "Invalid profile data."
        : "Failed to save profile";

    res.status(message === "Failed to save profile" ? 500 : 400).json({ message });
  }
};