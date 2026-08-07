import { Router } from "express";

const router = Router();

// Register API
router.post("/register", (req, res) => {

    const { name, email, password } = req.body || {};

    res.json({
        message: "Register API working",
        user: {
            name,
            email
        }
    });

});


// Login API
router.post("/login", (req, res) => {

    const { email, password } = req.body || {};

    res.json({
        message: "Login API working",
        user: {
            email
        }
    });

});


export default router;