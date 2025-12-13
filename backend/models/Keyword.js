// models/Keyword.js
import mongoose from "mongoose";

const keywordSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "paused", "archived"],
        default: "active",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Keyword = mongoose.model("Keyword", keywordSchema);
export default Keyword;
