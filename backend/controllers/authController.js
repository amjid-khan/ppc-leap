import User from "../models/User.js";
import { generateToken } from "../utils/token.js";


// REGISTER
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;


        if (!name || !email || !password)
            return res.status(400).json({ message: "All fields required" });


        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already exists" });


        const user = await User.create({ name, email, password, role: "user" });


        res.status(201).json({
            message: "User Registered",
            user: { id: user._id, name: user.name, email: user.email },
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// LOGIN
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password)
            return res.status(400).json({ message: "All fields required" });


        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });


        const match = await user.comparePassword(password);
        if (!match) return res.status(400).json({ message: "Invalid Credentials" });


        res.json({
            message: "Login Successful",
            user: { id: user._id, name: user.name, email: user.email },
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

