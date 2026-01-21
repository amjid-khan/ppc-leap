import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMerchantErrors } from "../controllers/merchantErrorsController.js";

const router = express.Router();

// GET Merchant "Needs Attention" Errors    http://localhost:5000/api/merchant/merchantid/errors
router.get(
    "/merchant/:merchantId/errors",
    protect,
    getMerchantErrors
);

export default router;
