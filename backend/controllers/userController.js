import pool from "../db.js";
import bcrypt from "bcryptjs";

/* GET ALL USERS */
export const getUsers = async(req, res) => {
    const [rows] = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      i.mobile,
      i.address,
      i.status
    FROM users u
    LEFT JOIN igc_profiles i ON i.user_id = u.id
    ORDER BY u.created_at DESC
  `);

    res.json(rows);
};

/* CREATE USER (ANY ROLE) */
export const createUser = async(req, res) => {
    const { name, email, password, role, mobile, address } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const [user] = await pool.query(
        "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)", [name, email, hash, role]
    );

    /* If role is IGC, create profile */
    if (role === "IGC") {
        await pool.query(
            "INSERT INTO igc_profiles (user_id,mobile,address,status) VALUES (?,?,?,?)", [user.insertId, mobile, address, "ACTIVE"]
        );
    }

    res.json({ message: "User created" });
};

/* ACTIVATE / DEACTIVATE USER */
export const toggleUserStatus = async(req, res) => {
    const { id } = req.params;

    await pool.query(
        "UPDATE igc_profiles SET status = IF(status='ACTIVE','INACTIVE','ACTIVE') WHERE user_id = ?", [id]
    );

    res.json({ message: "Status updated" });
};
export const updateIGCProfile = async(req, res) => {
    const { address, gst_no, contact_person, mobile } = req.body;

    await pool.query(
        `UPDATE users 
     SET address=?, gst_no=?, contact_person=?, mobile=?
     WHERE id=? AND role='IGC'`, [address, gst_no, contact_person, mobile, req.params.id]
    );

    res.json({ message: "IGC profile updated" });
};