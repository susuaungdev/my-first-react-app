import { Router } from "express";

import {
    register,
    login
} from "../controllers/authController";

import { authMiddleware } from "../middleware/authMiddleware";


const router = Router();


router.post("/register", register);

router.post("/login", login);


router.get(
    "/protected",
    authMiddleware,
    (req, res) => {

        res.status(200).json({
            message: "Protected route accessed successfully",
            user: req.user
        });

    }
);


export default router;