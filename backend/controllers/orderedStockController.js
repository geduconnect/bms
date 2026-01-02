import pool from "../db.js";

/* ➕ CREATE ORDERED STOCK */
export const createOrderedStock = async(req, res) => {
    const {
        university,
        subject,
        specialization,
        semester,
        quantity,
        vendor,
        order_date,
    } = req.body;

    if (!university || !subject || !quantity) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    await pool.query(
        `INSERT INTO ordered_stock
     (university, subject, specialization, semester, quantity, vendor, order_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            university,
            subject,
            specialization || null,
            semester || null,
            quantity,
            vendor || null,
            order_date || null,
            req.user.id, // 👤 logged-in user
        ]
    );

    res.json({ message: "Ordered stock created" });
};


/* 📋 GET ALL ORDERED STOCK */
export const getOrderedStock = async(req, res) => {
    const [rows] = await pool.query(`
    SELECT 
      o.*,
      IFNULL(SUM(r.quantity), 0) AS received_qty,
      (o.quantity - IFNULL(SUM(r.quantity), 0)) AS remaining_qty
    FROM ordered_stock o
    LEFT JOIN received_stock r ON r.ordered_stock_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `);

    res.json(rows);
};