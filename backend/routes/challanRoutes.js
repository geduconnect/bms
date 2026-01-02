import express from "express";
import { auth } from "../middleware/auth.js";
import {
    createChallan,
    getChallans,
    updateChallanStatus,
    getChallanHistory,
    issueChallanStock,
    generateChallanPDF,
    packChallan,
    dispatchChallan,
    markDelivered,
} from "../controllers/challanController.js";

const router = express.Router();

router.get("/", auth, getChallans);
router.post("/", auth, createChallan);

router.put("/:id/status", auth, updateChallanStatus); // Admin
router.put("/:id/pack", auth, packChallan); // Warehouse
router.put("/:id/dispatch", auth, dispatchChallan); // Dispatch
router.put("/:id/delivered", auth, markDelivered); // Admin/System

router.post("/", auth, createChallan);

router.get("/:id/history", auth, getChallanHistory);
router.put("/:id/issue", auth, issueChallanStock);
router.get("/challans/:id/pdf", auth, generateChallanPDF);


export default router;