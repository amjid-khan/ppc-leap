// routes/keywordRoutes.js
import express from "express";
import keywordController from "../controllers/keywordController.js";

const router = express.Router();

// Add a new keyword
router.post("/add", keywordController.addKeyword);

// Get all keywords
router.get("/", keywordController.getKeywords);

export default router;
