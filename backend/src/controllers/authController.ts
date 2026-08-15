import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";
import db from "../config/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 12;
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  password: string;
};

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret?.trim()) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwtSecret;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }

    const cleanName = name.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 100) {
      res.status(400).json({
        message: "Name must be between 2 and 100 characters long",
      });
      return;
    }

    if (cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      res.status(400).json({
        message: "Please enter a valid email address",
      });
      return;
    }

    if (password.length < 8 || password.length > 128) {
      res.status(400).json({
        message: "Password must be between 8 and 128 characters long",
      });
      return;
    }

    const [existingRows] = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      res.status(409).json({
        message: "Email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await db.execute(
      `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `,
      [cleanName, cleanEmail, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error: unknown) {
    console.error("Registration failed:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      res.status(409).json({
        message: "Email already exists",
      });
      return;
    }

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanEmail.length > 254 ||
      !EMAIL_REGEX.test(cleanEmail) ||
      !password ||
      password.length > 128
    ) {
      res.status(401).json({
        message: INVALID_CREDENTIALS_MESSAGE,
      });
      return;
    }

    const [rows] = await db.execute<UserRow[]>(
      `
        SELECT id, name, email, password
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [cleanEmail]
    );

    const user = rows[0];

    if (!user) {
      res.status(401).json({
        message: INVALID_CREDENTIALS_MESSAGE,
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      res.status(401).json({
        message: INVALID_CREDENTIALS_MESSAGE,
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      getJwtSecret(),
      {
        algorithm: "HS256",
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};