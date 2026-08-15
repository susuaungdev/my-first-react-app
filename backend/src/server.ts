import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import authRoutes from "./routes/authRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import profileRoutes from "./routes/profileRoutes";
import resumeRoutes from "./routes/resumeRoutes";
import interviewRoutes from "./routes/interviewRoutes";
import savedJobRoutes from "./routes/savedJobRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import db from "./config/db";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

if (!process.env.JWT_SECRET?.trim()) {
  throw new Error("JWT_SECRET is required in the backend .env file.");
}

const configuredOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    dotfiles: "deny",
    index: false,
    maxAge: NODE_ENV === "production" ? "1d" : 0,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "CareerFlow API is running 🚀",
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "API route not found.",
  });
});

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error("Unhandled server error:", error);

    if (error.message === "Origin not allowed by CORS.") {
      res.status(403).json({
        message: "This origin is not allowed to access the API.",
      });
      return;
    }

    res.status(500).json({
      message: "An unexpected server error occurred.",
    });
  }
);

const startServer = async () => {
  try {
    const connection = await db.getConnection();
    console.log("MySQL Connected ✅");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

if (NODE_ENV !== "test") {
  void startServer();
}

export { app };
export default app;