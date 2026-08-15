import { type Request, type Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../config/db";

const templates = new Set(["classic", "modern", "professional", "minimal", "executive", "creative"]);
const colors = new Set(["blue", "emerald", "purple", "rose", "slate", "orange"]);

const text = (value: unknown, max: number, required = false) => {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error("Resume title is required");
    return null;
  }
  if (typeof value !== "string") throw new Error("Invalid resume data");
  const cleaned = value.trim();
  if (required && !cleaned) throw new Error("Resume title is required");
  if (cleaned.length > max) throw new Error("One or more resume fields are too long");
  return cleaned || null;
};

const url = (value: unknown) => {
  const cleaned = text(value, 2048);
  if (!cleaned) return null;
  try {
    const parsed = new URL(cleaned);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch {
    throw new Error("Resume links must be valid HTTP or HTTPS URLs");
  }
  return cleaned;
};

const arrayJson = (value: unknown, maxItems: number) => {
  if (value === undefined || value === null || value === "") return null;
  let parsed = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); } catch { throw new Error("Invalid resume section data"); }
  }
  if (!Array.isArray(parsed) || parsed.length > maxItems) {
    throw new Error(`Resume sections may contain at most ${maxItems} items`);
  }
  const serialized = JSON.stringify(parsed);
  if (serialized.length > 100000) throw new Error("Resume section data is too large");
  return serialized;
};

const resumePayload = (body: Record<string, unknown>) => {
  const template = typeof body.template === "string" ? body.template : "classic";
  const accentColor = typeof body.accent_color === "string" ? body.accent_color : "blue";
  if (!templates.has(template)) throw new Error("Invalid resume template");
  if (!colors.has(accentColor)) throw new Error("Invalid resume accent color");

  return [
    text(body.title, 200, true), text(body.summary, 10000), text(body.phone, 50),
    text(body.location, 150), url(body.linkedin_url), url(body.github_url),
    url(body.portfolio_url), text(body.skills, 5000), arrayJson(body.experience, 50),
    arrayJson(body.education, 30), arrayJson(body.projects, 50), template, accentColor,
  ];
};

const userIdOr401 = (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) res.status(401).json({ message: "Unauthorized" });
  return userId;
};

const resumeIdOr400 = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "Invalid resume ID" });
    return null;
  }
  return id;
};

const controllerError = (res: Response, label: string, error: unknown) => {
  console.error(`${label} resume error:`, error);
  const message = error instanceof Error ? error.message : `Failed to ${label.toLowerCase()} resume`;
  const validationMessages = ["Resume title is required", "Invalid resume data", "One or more resume fields are too long", "Resume links must be valid HTTP or HTTPS URLs", "Invalid resume section data", "Resume section data is too large", "Invalid resume template", "Invalid resume accent color"];
  const validation = validationMessages.includes(message) || message.startsWith("Resume sections may contain");
  res.status(validation ? 400 : 500).json({ message: validation ? message : `Failed to ${label.toLowerCase()} resume` });
};

const columns = `id, title, summary, phone, location, linkedin_url, github_url,
 portfolio_url, skills, experience, education, projects, template, accent_color,
 created_at, updated_at`;

export const createResume = async (req: Request, res: Response) => {
  try {
    const userId = userIdOr401(req, res); if (!userId) return;
    const payload = resumePayload(req.body || {});
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO resumes (user_id, title, summary, phone, location, linkedin_url,
       github_url, portfolio_url, skills, experience, education, projects, template, accent_color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, ...payload]
    );
    res.status(201).json({ message: "Resume created successfully", resumeId: result.insertId });
  } catch (error) { controllerError(res, "Create", error); }
};

export const getResumes = async (req: Request, res: Response) => {
  try {
    const userId = userIdOr401(req, res); if (!userId) return;
    const [rows] = await db.execute<RowDataPacket[]>(`SELECT ${columns} FROM resumes WHERE user_id = ? ORDER BY updated_at DESC`, [userId]);
    res.status(200).json({ message: "Resumes fetched successfully", resumes: rows });
  } catch (error) { controllerError(res, "Fetch", error); }
};

export const getResumeById = async (req: Request, res: Response) => {
  try {
    const userId = userIdOr401(req, res); if (!userId) return;
    const resumeId = resumeIdOr400(req, res); if (!resumeId) return;
    const [rows] = await db.execute<RowDataPacket[]>(`SELECT ${columns} FROM resumes WHERE id = ? AND user_id = ? LIMIT 1`, [resumeId, userId]);
    if (!rows[0]) { res.status(404).json({ message: "Resume not found" }); return; }
    res.status(200).json({ message: "Resume fetched successfully", resume: rows[0] });
  } catch (error) { controllerError(res, "Fetch", error); }
};

export const updateResume = async (req: Request, res: Response) => {
  try {
    const userId = userIdOr401(req, res); if (!userId) return;
    const resumeId = resumeIdOr400(req, res); if (!resumeId) return;
    const payload = resumePayload(req.body || {});
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE resumes SET title=?, summary=?, phone=?, location=?, linkedin_url=?,
       github_url=?, portfolio_url=?, skills=?, experience=?, education=?, projects=?,
       template=?, accent_color=? WHERE id=? AND user_id=?`,
      [...payload, resumeId, userId]
    );
    if (!result.affectedRows) { res.status(404).json({ message: "Resume not found" }); return; }
    res.status(200).json({ message: "Resume updated successfully" });
  } catch (error) { controllerError(res, "Update", error); }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    const userId = userIdOr401(req, res); if (!userId) return;
    const resumeId = resumeIdOr400(req, res); if (!resumeId) return;
    const [result] = await db.execute<ResultSetHeader>("DELETE FROM resumes WHERE id = ? AND user_id = ?", [resumeId, userId]);
    if (!result.affectedRows) { res.status(404).json({ message: "Resume not found" }); return; }
    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) { controllerError(res, "Delete", error); }
};