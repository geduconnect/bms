import express from "express";
import {
    createIGCUser,
    getIGCs,
    getMyChallans,
} from "../controllers/igcController.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

/* ================= ADMIN ================= */

// Create IGC user (Admin / Super Admin)
router.post("/", auth, allowRoles("ADMIN", "SUPER_ADMIN"), createIGCUser);

// List all IGCs (Admin)
router.get("/", auth, allowRoles("ADMIN", "SUPER_ADMIN"), getIGCs);

/* ================= IGC ================= */

// Logged-in IGC → own challans
router.get("/my-challans", auth, allowRoles("IGC"), getMyChallans);

export default router;