import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


interface JwtPayload {
    id: number;
    email: string;
}


export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).json({
            message: "Access denied. No token provided."
        });

    }


    const token = authHeader.split(" ")[1];


    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;


        req.user = {
            id: decoded.id,
            email: decoded.email
        };


        next();


    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

};