import pool from "../db.js";

/* ================= CREATE IGC USER ================= */
export const createIGCUser = async (req, res) => {
  const { name, email, password, address, mobile } = req.body;

  if (!name || !email || !password || !mobile) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Create user
    const [userRes] = await conn.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES (?, ?, ?, 'IGC', 1)`,
      [name, email, password]
    );

    const userId = userRes.insertId;

    // 2️⃣ Create IGC profile
    await conn.query(
      `INSERT INTO igc_profiles (user_id, address, mobile)
       VALUES (?, ?, ?)`,
      [userId, address || null, mobile]
    );

    await conn.commit();
    res.json({ message: "IGC user created" });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
export const getIGCs = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      i.mobile,
      i.address,
      i.status
    FROM users u
    LEFT JOIN igc_profiles i ON i.user_id = u.id
    WHERE u.role = 'IGC'
  `);

  res.json(rows);
};

export const getMyChallans = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT challan_no, university, subject, semester, quantity, status, created_at
     FROM challans
     WHERE igc_user_id = ?
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  res.json(rows);
};
