import express from "express";
import { registerUser, loginUser, getAllUsers, verifyToken, getAllAccounts, getProductCount } from "../controllers/authController.js";
import { protect as authMiddleware, superadminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Basic email/password auth only
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", superadminOnly, getAllUsers);
router.get("/accounts", superadminOnly, getAllAccounts);
router.get("/verify", verifyToken);

// Super admin routes
router.get("/superadmin/product-count", superadminOnly, getProductCount);

export default router;