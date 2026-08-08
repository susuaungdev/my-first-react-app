import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db";


// REGISTER USER
export const register = async (
    req: Request,
    res: Response
) => {

    try {

        const { name, email, password } = req.body || {};


            // Check required fields
            if (!name || !email || !password) {
                return res.status(400).json({
                    message: "All fields are required"
                });
            }


            // Clean user input
            const cleanName = name.trim();
            const cleanEmail = email.trim().toLowerCase();


            // Validate name
            if (cleanName.length < 2) {
                return res.status(400).json({
                    message: "Name must be at least 2 characters long"
                });
            }


            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    message: "Please enter a valid email address"
                });
            }


            // Validate password
            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters long"
                });
            }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        const sql = `
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
        `;


       await db.execute(sql, [
            cleanName,
            cleanEmail,
            hashedPassword
        ]);


        return res.status(201).json({
            message: "User registered successfully"
        });


    } catch (error: any) {

        console.log(error);


        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Email already exists"
            });
        }


        return res.status(500).json({
            message: "Registration failed"
        });

    }

};



// LOGIN USER
export const login = async (
    req: Request,
    res: Response
) => {

    try {

        const { email, password } = req.body || {};


            // Check required fields
            if (!email || !password) {
                return res.status(400).json({
                    message: "Email and password are required"
                });
            }


            // Clean email
            const cleanEmail = email.trim().toLowerCase();


            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    message: "Please enter a valid email address"
                });
            }


        // Find user by email
        const [rows]: any = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [cleanEmail]
        );


        if (rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = rows[0];


        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "1d"
            }
        );


        return res.status(200).json({

            message: "Login successful",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }

        });


    } catch (error) {

        console.log(error);


        return res.status(500).json({
            message: "Login failed"
        });

    }

};