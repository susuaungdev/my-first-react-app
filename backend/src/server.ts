import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import db from "./config/db";


dotenv.config();


const app = express();


app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);



app.get("/", (req,res)=>{
    res.send("CareerFlow API is running 🚀");
});



const PORT = 5000;


app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});

db.getConnection()
.then(()=>{
    console.log("MySQL Connected ✅");
})
.catch((error)=>{
    console.log("Database Error:", error);
});