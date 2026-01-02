import express from "express";
import { auth } from "../middleware/auth.js";
import { login } from "../controllers/authController.js";
import pool from "../db.js";

const router = express.Router();
router.post("/login", login);
/* 🔄 WHO AM I */
router.get("/me", auth, async(req, res) => {
    const [rows] = await pool.query(
        "SELECT id, name, role FROM users WHERE id = ?", [req.user.id]
    );
    res.json(rows[0]);
});


/* 🚪 LOGOUT */
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
    });
    res.json({ message: "Logged out" });
});

export default router;