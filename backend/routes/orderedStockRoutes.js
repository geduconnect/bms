import express from "express";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/allowRoles.js";
import {
    createOrderedStock,
    getOrderedStock,
} from "../controllers/orderedStockController.js";

const router = express.Router();

/* ➕ Create Ordered Stock (Admin / Super Admin) */
router.post(
    "/",
    auth,
    allowRoles("ADMIN", "SUPER_ADMIN"),
    createOrderedStock
);

/* 📋 Get Ordered Stock (All logged-in users) */
router.get("/", auth, getOrderedStock);

export default router;