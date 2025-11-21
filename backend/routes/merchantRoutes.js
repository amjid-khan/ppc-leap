import express from "express";
import merchantController from "../controllers/merchantController.js";

const router = express.Router();

router.get("/products", merchantController.getMerchantProducts);

export default router;
