import pool from "../db.js";
/* ➕ RECEIVE STOCK (PARTIAL ALLOWED) */
export const receiveStock = async(req, res) => {
    const {
        ordered_stock_id,
        university,
        subject,
        specialization,
        semester,
        quantity,
    } = req.body;

    if (!ordered_stock_id || !quantity) {
        return res.status(400).json({ message: "Invalid receive data" });
    }

    /* 1️⃣ Insert into received_stock */
    await pool.query(
        `INSERT INTO received_stock
     (ordered_stock_id, university, subject, specialization, semester, quantity)
     VALUES (?, ?, ?, ?, ?, ?)`, [ordered_stock_id, university, subject, specialization, semester, quantity]
    );

    /* 2️⃣ Update AVAILABLE stock */
    const [existing] = await pool.query(
        `SELECT id FROM stock
     WHERE university=? AND subject=?
     AND IFNULL(specialization,'')=IFNULL(?, '')
     AND IFNULL(semester,'')=IFNULL(?, '')`, [university, subject, specialization, semester]
    );

    let stockId;

    if (existing.length) {
        stockId = existing[0].id;
        await pool.query(
            `UPDATE stock SET available_qty = available_qty + ? WHERE id = ?`, [quantity, stockId]
        );
    } else {
        const [result] = await pool.query(
            `INSERT INTO stock
       (university, subject, specialization, semester, available_qty)
       VALUES (?, ?, ?, ?, ?)`, [university, subject, specialization, semester, quantity]
        );
        stockId = result.insertId;
    }

    /* 3️⃣ Insert history (RECEIVED) */
    await pool.query(
        `INSERT INTO stock_history
     (stock_id, type, quantity, ref_table, ref_id)
     VALUES (?, 'RECEIVED', ?, 'received_stock', ?)`, [stockId, quantity, ordered_stock_id]
    );

    /* 4️⃣ Update ordered_stock status */
    await pool.query(
        `UPDATE ordered_stock
   SET status =
     CASE
       WHEN quantity <= (
         SELECT SUM(quantity)
         FROM received_stock
         WHERE ordered_stock_id = ?
       ) THEN 'COMPLETED'
       ELSE 'PARTIAL'
     END
   WHERE id = ?`, [ordered_stock_id, ordered_stock_id]
    );

    res.json({ message: "Stock received successfully" });
};

/* 📋 GET RECEIVED STOCK */
export const getReceivedStock = async(req, res) => {
    const [rows] = await pool.query(
        `
    SELECT 
      r.id,
      r.university,
      r.subject,
      r.specialization,
      r.semester,
      r.quantity,
      r.created_at AS received_at,
      u.name AS received_by
    FROM received_stock r
    LEFT JOIN users u ON u.id = r.received_by
    ORDER BY r.created_at DESC
    `
    );

    res.json(rows);
};
export const getReceiveHistoryByOrder = async(req, res) => {
    const { orderId } = req.params;

    const [rows] = await pool.query(
        `
    SELECT 
      r.quantity,
      r.created_at,
      u.name AS received_by
    FROM received_stock r
    LEFT JOIN users u ON u.id = r.received_by
    WHERE r.ordered_stock_id = ?
    ORDER BY r.created_at DESC
  `, [orderId]
    );

    res.json(rows);
};
export const exportReceivedCSV = async(req, res) => {
    const [rows] = await pool.query(`
    SELECT 
      r.university,
      r.subject,
      r.quantity,
      u.name AS received_by,
      r.created_at
    FROM received_stock r
    LEFT JOIN users u ON u.id = r.received_by
    ORDER BY r.created_at DESC
  `);

    let csv = "University,Subject,Quantity,Received By,Date\n";

    rows.forEach((r) => {
        csv += `${r.university},${r.subject},${r.quantity},${r.received_by},${r.created_at}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("received_stock_report.csv");
    res.send(csv);
};