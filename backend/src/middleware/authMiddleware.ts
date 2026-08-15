import {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import jwt, { type JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";

type CareerFlowJwtPayload = JsonWebTokenPayload & {
  id: number;
  email: string;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      message: "Access denied. No token provided.",
    });
    return;
  }

  const [scheme, token, extraPart] = authHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token || extraPart) {
    res.status(401).json({
      message: "Access denied. Invalid authorization header.",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret?.trim()) {
    console.error("JWT_SECRET is not configured.");

    res.status(500).json({
      message: "Authentication is temporarily unavailable.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "number" ||
      !Number.isInteger(decoded.id) ||
      decoded.id <= 0 ||
      typeof decoded.email !== "string" ||
      !decoded.email.trim()
    ) {
      res.status(401).json({
        message: "Invalid or expired token.",
      });
      return;
    }

    const payload = decoded as CareerFlowJwtPayload;

    req.user = {
      id: payload.id,
      email: payload.email.trim().toLowerCase(),
    };

    next();
  } catch (error) {
    if (!(error instanceof jwt.TokenExpiredError)) {
      console.warn("JWT verification failed:", error);
    }

    res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};