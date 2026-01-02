import pool from "../db.js";

/* 📦 GET AVAILABLE STOCK */
export const getStock = async(req, res) => {
    const [rows] = await pool.query(
        `SELECT * FROM stock ORDER BY university, subject`
    );
    res.json(rows);
};
export const getStockHistory = async(req, res) => {
    const stockId = req.params.id;

    const [rows] = await pool.query(
        `
    SELECT 
      h.type,
      h.quantity,
      h.created_at,
      u.name AS action_by
    FROM stock_history h
    LEFT JOIN users u ON u.id = h.created_by
    WHERE h.stock_id = ?
    ORDER BY h.created_at DESC
  `, [stockId]
    );

    res.json(rows);
};
export const getAvailableStockByFilter = async(req, res) => {
    const { university, subject, specialization, semester } = req.query;

    const [rows] = await pool.query(
        `SELECT available_qty FROM stock
     WHERE university=? AND subject=? AND
           (specialization=? OR ? IS NULL) AND
           (semester=? OR ? IS NULL)
     LIMIT 1`, [university, subject, specialization, specialization, semester, semester]
    );

    res.json(rows[0] || { available_qty: 0 });
};
export const getStockForChallan = async(req, res) => {
    const [rows] = await pool.query(`
    SELECT 
      id,
      university,
      subject,
      specialization,
      semester,
      available_qty
    FROM stock
    WHERE available_qty > 0
    ORDER BY university, subject
  `);

    res.json(rows);
};