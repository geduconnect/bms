import express from "express";
import { auth } from "../middleware/auth.js";
import {
    getStock,
    getStockHistory,
    getAvailableStockByFilter,
    getStockForChallan,
} from "../controllers/stockController.js";

const router = express.Router();

/* 📦 Get Available Stock */
router.get("/", auth, getStock);

/* 📜 Get Stock History (Received / Issued) */
router.get("/:id/history", auth, getStockHistory);
router.get("/available/check", auth, getAvailableStockByFilter);
router.get("/for-challan", auth, getStockForChallan);

export default router;