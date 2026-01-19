import express from "express";
import { registerUser, loginUser, getAllUsers, verifyToken, getAllAccounts, getProductCount } from "../controllers/authController.js";
import { protect as authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Basic email/password auth only
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", authMiddleware, getAllUsers);
router.get("/accounts", authMiddleware, getAllAccounts);
router.get("/verify", verifyToken);

// Super admin routes
router.get("/superadmin/product-count", authMiddleware, getProductCount);

export default router;