// controllers/keywordController.js
import Keyword from "../models/Keyword.js";

const addKeyword = async (req, res) => {
    try {
        const { text, status } = req.body;

        const existing = await Keyword.findOne({ text });
        if (existing) {
            return res.status(400).json({ message: "Keyword already exists" });
        }

        const keyword = new Keyword({
            text,
            status: status || "active",
        });

        await keyword.save();
        res.status(201).json({ message: "Keyword added successfully", keyword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getKeywords = async (req, res) => {
    try {
        const keywords = await Keyword.find().sort({ createdAt: -1 });
        res.json(keywords);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export default { addKeyword, getKeywords };
