import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import merchantController from "../controllers/merchantController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/products", merchantController.getMerchantProducts);

export default router;
