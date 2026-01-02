import express from "express";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/allowRoles.js";
import {
    getUsers,
    createUser,
    toggleUserStatus,
    updateIGCProfile
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", auth, allowRoles("ADMIN", "SUPER_ADMIN"), getUsers);
router.post("/", auth, allowRoles("ADMIN", "SUPER_ADMIN"), createUser);
router.patch("/:id/status", auth, allowRoles("ADMIN", "SUPER_ADMIN"), toggleUserStatus);
router.put("/igc/:id/profile", auth, updateIGCProfile);

export default router;