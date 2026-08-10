import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/authRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import profileRoutes from "./routes/profileRoutes";
import resumeRoutes from "./routes/resumeRoutes";
import interviewRoutes from "./routes/interviewRoutes";
import db from "./config/db";

dotenv.config();

const app = express();

// ===============================
// Middleware
// ===============================

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "../uploads"
    )
  )
);

// ===============================
// Routes
// ===============================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/resumes",
  resumeRoutes
);

app.use(
  "/api/interviews",
  interviewRoutes
);

// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "CareerFlow API is running 🚀",
  });
});

// ===============================
// Server
// ===============================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});

// ===============================
// Database Connection
// ===============================

db.getConnection()
  .then((connection) => {
    console.log(
      "MySQL Connected ✅"
    );

    connection.release();
  })
  .catch((error) => {
    console.error(
      "Database Error:",
      error
    );
  });