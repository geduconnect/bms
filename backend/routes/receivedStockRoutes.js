import express from "express";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/allowRoles.js";
import {
    receiveStock,
    getReceivedStock,
    getReceiveHistoryByOrder,
    exportReceivedCSV,
} from "../controllers/receivedStockController.js";

const router = express.Router();

/* ➕ Receive Stock (Warehouse / Super Admin) */
router.post("/", auth, allowRoles("WAREHOUSE", "SUPER_ADMIN"), receiveStock);

/* 📋 Get Received Stock */
router.get("/", auth, getReceivedStock);
router.get("/order/:orderId", auth, getReceiveHistoryByOrder);
router.get("/export/csv", auth, exportReceivedCSV);
export default router;