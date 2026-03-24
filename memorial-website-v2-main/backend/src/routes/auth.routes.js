import express from "express";
import { adminLogin, refreshToken, logout, verifyToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/verify", verifyToken);

export default router;