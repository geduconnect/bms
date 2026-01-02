import pool from "../db.js";
import PDFDocument from "pdfkit";
export const createChallan = async(req, res) => {
    const {
        university,
        subject,
        specialization,
        semester,
        quantity,
        igc_user_id,
    } = req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!university || !subject || !quantity || !igc_user_id) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
    }

    /* ---------- FETCH IGC DETAILS ---------- */
    const [igcRows] = await pool.query(
        `SELECT name, address, mobile 
     FROM users 
     WHERE id = ? AND role = 'IGC'`, [igc_user_id]
    );

    if (!igcRows.length) {
        return res.status(400).json({ message: "Invalid IGC selected" });
    }

    const {
        name: igc_name,
        address: igc_address,
        mobile: igc_mobile,
    } = igcRows[0];

    /* ---------- NORMALIZE OPTIONAL FIELDS ---------- */
    const spec = specialization || null;
    const sem = semester || null;

    /* ---------- FIND STOCK ---------- */
    const [stockRows] = await pool.query(
        `SELECT id, available_qty 
     FROM stock
     WHERE university = ?
       AND subject = ?
       AND (specialization = ? OR ? IS NULL)
       AND (semester = ? OR ? IS NULL)
     LIMIT 1`, [university, subject, spec, spec, sem, sem]
    );

    if (!stockRows.length) {
        return res.status(400).json({ message: "Stock not found" });
    }

    if (stockRows[0].available_qty < qty) {
        return res.status(400).json({ message: "Insufficient stock" });
    }

    const stockId = stockRows[0].id;

    /* ---------- TRANSACTION ---------- */
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1️⃣ Create challan
        const [result] = await conn.query(
            `INSERT INTO challans
      (challan_no, university, igc_user_id, igc_name, igc_address, igc_mobile,
       subject, specialization, semester, quantity, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                "CH-" + Date.now(),
                university,
                igc_user_id,
                igc_name,
                igc_address,
                igc_mobile,
                subject,
                spec,
                sem,
                qty,
                req.user.id,
            ]
        );

        const challanId = result.insertId;

        // 2️⃣ Deduct stock
        await conn.query(
            `UPDATE stock 
       SET available_qty = available_qty - ?
       WHERE id = ?`, [qty, stockId]
        );

        // 3️⃣ Link challan ↔ stock
        await conn.query(
            `INSERT INTO challan_items (challan_id, stock_id, quantity)
       VALUES (?, ?, ?)`, [challanId, stockId, qty]
        );

        // 4️⃣ Stock history
        await conn.query(
            `INSERT INTO stock_history
       (stock_id, type, quantity, ref_table, ref_id, created_by)
       VALUES (?, 'ISSUED', ?, 'challans', ?, ?)`, [stockId, qty, challanId, req.user.id]
        );

        // 5️⃣ Challan history
        await conn.query(
            `INSERT INTO challan_history
       (challan_id, status, updated_by)
       VALUES (?, 'INITIATED', ?)`, [challanId, req.user.id]
        );

        await conn.commit();
        res.json({ message: "Challan created & stock issued successfully" });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: "Failed to create challan" });
    } finally {
        conn.release();
    }
};

/* ================= GET CHALLANS ================= */
export const getChallans = async(req, res) => {
    try {
        let query = `
      SELECT 
        c.*,
        u.name AS igc_name
      FROM challans c
      LEFT JOIN users u ON u.id = c.igc_user_id
      WHERE 1=1
    `;

        const params = [];

        // ❗ IMPORTANT:
        // DO NOT FILTER BY ROLE HERE
        // Warehouse, Dispatch, Admin must ALL get data

        // Optional filters only (safe)
        if (req.query.status) {
            query += " AND c.status = ?";
            params.push(req.query.status);
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch challans" });
    }
};

/* ================= UPDATE STATUS ================= */
export const updateChallanStatus = async(req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // 🔥 THIS LINE FIXES EVERYTHING
    await pool.query("UPDATE challans SET status = ? WHERE id = ?", [status, id]);

    await pool.query(
        `INSERT INTO challan_history
     (challan_id, status, remarks, updated_by)
     VALUES (?, ?, ?, ?)`, [id, status, remarks || null, req.user.id]
    );

    res.json({ message: "Challan status updated" });
};

/* ================= HISTORY ================= */
export const getChallanHistory = async(req, res) => {
    const challanId = req.params.id;

    const [rows] = await pool.query(
        `
    SELECT 
      h.status,
      h.remarks,
      h.created_at,
      u.name AS updated_by
    FROM challan_history h
    LEFT JOIN users u ON u.id = h.updated_by
    WHERE h.challan_id = ?
    ORDER BY h.created_at ASC
  `, [challanId]
    );

    res.json(rows);
};
export const issueChallanStock = async(req, res) => {
    const challanId = req.params.id;

    // 🔐 Role check
    if (req.user.role !== "WAREHOUSE") {
        return res.status(403).json({ message: "Only warehouse can issue stock" });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1️⃣ Get challan
        const [
            [challan]
        ] = await conn.query(`SELECT * FROM challans WHERE id=?`, [
            challanId,
        ]);

        if (!challan) {
            return res.status(404).json({ message: "Challan not found" });
        }

        if (challan.status !== "APPROVED") {
            return res.status(400).json({
                message: "Only approved challans can be issued",
            });
        }

        // 2️⃣ Get stock mapping
        const [
            [item]
        ] = await conn.query(
            `SELECT * FROM challan_items WHERE challan_id=?`, [challanId]
        );

        // 3️⃣ Update challan status
        await conn.query(`UPDATE challans SET status='ISSUED' WHERE id=?`, [
            challanId,
        ]);

        // 4️⃣ Stock history
        await conn.query(
            `INSERT INTO stock_history
       (stock_id, type, quantity, ref_table, ref_id, created_by)
       VALUES (?, 'ISSUED', ?, 'challans', ?, ?)`, [item.stock_id, item.quantity, challanId, req.user.id]
        );

        // 5️⃣ Challan history
        await conn.query(
            `INSERT INTO challan_history
       (challan_id, status, remarks, updated_by)
       VALUES (?, 'ISSUED', 'Issued by warehouse', ?)`, [challanId, req.user.id]
        );

        await conn.commit();
        res.json({ message: "Stock issued successfully" });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: "Issue failed" });
    } finally {
        conn.release();
    }
};
export const packChallan = async(req, res) => {
    const { id } = req.params;

    await pool.query("UPDATE challans SET status = 'PACKED' WHERE id = ?", [id]);

    await pool.query(
        `INSERT INTO challan_history
     (challan_id, status, updated_by)
     VALUES (?, 'PACKED', ?)`, [id, req.user.id]
    );

    res.json({ message: "Challan packed" });
};
export const dispatchChallan = async(req, res) => {
    if (req.user.role !== "DISPATCH") {
        return res.status(403).json({ message: "Access denied" });
    }

    const { delivery_mode, docket_no, transport_slip, delivery_charges } =
    req.body;

    if (!delivery_mode) {
        return res.status(400).json({ message: "Delivery mode required" });
    }

    await pool.query(
        `UPDATE challans
     SET status='DISPATCHED',
         dispatched_at=NOW(),
         delivery_mode=?,
         docket_no=?,
         transport_slip=?,
         delivery_charges=?
     WHERE id=?`, [
            delivery_mode,
            docket_no || null,
            transport_slip || null,
            delivery_charges || 0,
            req.params.id,
        ]
    );

    await pool.query(
        `INSERT INTO challan_history (challan_id, status, remarks, updated_by)
     VALUES (?, 'DISPATCHED', ?, ?)`, [req.params.id, `Mode: ${delivery_mode}`, req.user.id]
    );

    res.json({ message: "Challan dispatched" });
};
export const markDelivered = async(req, res) => {
    await pool.query(
        `UPDATE challans
     SET status='DELIVERED', delivered_at=NOW()
     WHERE id=?`, [req.params.id]
    );

    await pool.query(
        `INSERT INTO challan_history (challan_id, status, updated_by)
     VALUES (?, 'DELIVERED', ?)`, [req.params.id, req.user.id]
    );

    res.json({ message: "Challan delivered" });
};

export const generateChallanPDF = async(req, res) => {
    const { id } = req.params;

    const [
        [c]
    ] = await pool.query(
        `SELECT c.*, u.name AS igc_name, u.mobile
     FROM challans c
     LEFT JOIN users u ON u.id = c.igc_user_id
     WHERE c.id = ?`, [id]
    );

    if (!c) return res.status(404).send("Challan not found");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `inline; filename=Challan-${c.challan_no}.pdf`
    );

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(18).text("DELIVERY CHALLAN", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Challan No: ${c.challan_no}`);
    doc.text(`University: ${c.university}`);
    doc.text(`IGC: ${c.igc_name}`);
    doc.text(`Mobile: ${c.mobile}`);
    doc.text(`Quantity: ${c.quantity}`);
    doc.text(`Status: ${c.status}`);

    doc.moveDown();
    doc.text(`Delivery Mode: ${c.delivery_mode || "-"}`);
    doc.text(`Docket No: ${c.docket_no || "-"}`);
    doc.text(`Transport Slip: ${c.transport_slip || "-"}`);
    doc.text(`Charges: ₹${c.delivery_charges || 0}`);

    doc.moveDown(2);
    doc.text("Authorized Signature: ____________________");

    doc.end();
};
export const deliveryChargesReport = async(req, res) => {
    const [rows] = await pool.query(`
    SELECT university, delivery_mode,
           COUNT(*) total_challans,
           SUM(quantity) total_books,
           SUM(delivery_charges) total_charges
    FROM challans
    WHERE status IN ('DISPATCHED','DELIVERED')
    GROUP BY university, delivery_mode
  `);
    res.json(rows);
};