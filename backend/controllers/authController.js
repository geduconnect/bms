import pool from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const login = async(req, res) => {
    const { email, password } = req.body;

    const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND status = 1", [email]
    );

    if (!rows.length)
        return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
        return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role },
        process.env.JWT_SECRET, { expiresIn: "1d" }
    );

    // 🔐 HTTP ONLY COOKIE
    res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true in HTTPS
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
        },
    });
};
export const logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};