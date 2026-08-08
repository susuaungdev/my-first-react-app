import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import db from "./config/db";

dotenv.config();

const app = express();


// ===============================
// Middleware
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// Routes
// ===============================

app.use("/api/auth", authRoutes);


// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {

    res.json({
        message: "CareerFlow API is running 🚀"
    });

});


// ===============================
// Server
// ===============================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});


// ===============================
// Database Connection
// ===============================

db.getConnection()

    .then((connection) => {

        console.log("MySQL Connected ✅");

        connection.release();

    })

    .catch((error) => {

        console.error(
            "Database Error:",
            error
        );

    });