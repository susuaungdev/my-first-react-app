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

const app =
  express();

/* =========================================================
   ENVIRONMENT
========================================================= */

const PORT =
  Number(
    process.env.PORT
  ) || 5000;

const NODE_ENV =
  process.env.NODE_ENV ||
  "development";

if (
  !process.env.JWT_SECRET?.trim()
) {
  throw new Error(
    "JWT_SECRET is required in the backend .env file."
  );
}

/* =========================================================
   FRONTEND ORIGINS
========================================================= */

const configuredOrigins =
  (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  )
    .split(",")
    .map(
      (
        origin
      ) =>
        origin.trim()
    )
    .filter(
      Boolean
    );

/* =========================================================
   PRODUCTION PROXY
========================================================= */

if (
  NODE_ENV ===
  "production"
) {
  app.set(
    "trust proxy",
    1
  );
}

/* =========================================================
   BASIC SECURITY
========================================================= */

app.disable(
  "x-powered-by"
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy:
        "cross-origin",
    },
  })
);

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin(
      origin,
      callback
    ) {
      if (
        !origin ||
        configuredOrigins.includes(
          origin
        )
      ) {
        callback(
          null,
          true
        );

        return;
      }

      callback(
        new Error(
          "Origin not allowed by CORS."
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials:
      false,

    maxAge:
      86400,
  })
);

/* =========================================================
   REQUEST BODY LIMITS

   Resume profile photos are currently sent as Base64 strings.
   Base64 is larger than the original image, so 1 MB is too low.

   5 MB is enough for the current 1.5 MB client-side photo limit
   plus the rest of the resume JSON.
========================================================= */

app.use(
  express.json({
    limit:
      "5mb",
  })
);

app.use(
  express.urlencoded({
    extended:
      true,

    limit:
      "5mb",
  })
);

/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use(
  "/uploads",

  express.static(
    path.join(
      __dirname,
      "../uploads"
    ),
    {
      dotfiles:
        "deny",

      index:
        false,

      maxAge:
        NODE_ENV ===
        "production"
          ? "1d"
          : 0,
    }
  )
);

/* =========================================================
   AUTH RATE LIMIT
========================================================= */

const authLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit:
      20,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    message: {
      message:
        "Too many authentication attempts. Please try again in 15 minutes.",
    },
  });

/* =========================================================
   API ROUTES
========================================================= */

app.use(
  "/api/auth",
  authLimiter,
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

app.use(
  "/api/saved-jobs",
  savedJobRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/",
  (
    _req:
      Request,

    res:
      Response
  ) => {
    res.status(
      200
    ).json({
      message:
        "CareerFlow API is running 🚀",
    });
  }
);

/* =========================================================
   404
========================================================= */

app.use(
  (
    _req:
      Request,

    res:
      Response
  ) => {
    res.status(
      404
    ).json({
      message:
        "API route not found.",
    });
  }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    error:
      Error & {
        type?: string;
        status?: number;
        statusCode?: number;
      },

    _req:
      Request,

    res:
      Response,

    _next:
      NextFunction
  ) => {
    console.error(
      "Unhandled server error:",
      error
    );

    /* =====================================================
       CORS
    ===================================================== */

    if (
      error.message ===
      "Origin not allowed by CORS."
    ) {
      res.status(
        403
      ).json({
        message:
          "This origin is not allowed to access the API.",
      });

      return;
    }

    /* =====================================================
       REQUEST BODY TOO LARGE
    ===================================================== */

    if (
      error.type ===
        "entity.too.large" ||
      error.status ===
        413 ||
      error.statusCode ===
        413
    ) {
      res.status(
        413
      ).json({
        message:
          "The uploaded image is too large. Please choose a smaller image.",
      });

      return;
    }

    /* =====================================================
       INVALID JSON
    ===================================================== */

    if (
      error instanceof
        SyntaxError &&
      "body" in error
    ) {
      res.status(
        400
      ).json({
        message:
          "Invalid request data.",
      });

      return;
    }

    /* =====================================================
       DEFAULT
    ===================================================== */

    res.status(
      500
    ).json({
      message:
        "An unexpected server error occurred.",
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

const startServer =
  async () => {
    try {
      const connection =
        await db.getConnection();

      console.log(
        "MySQL Connected ✅"
      );

      connection.release();

      app.listen(
        PORT,
        () => {
          console.log(
            `Server running on port ${PORT}`
          );
        }
      );
    } catch (
      error
    ) {
      console.error(
        "Database connection failed:",
        error
      );

      process.exit(
        1
      );
    }
  };

/* =========================================================
   START OUTSIDE TEST MODE
========================================================= */

if (
  NODE_ENV !==
  "test"
) {
  void startServer();
}

/* =========================================================
   EXPORT
========================================================= */

export {
  app,
};

export default app;