import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protect = async (req, res, next) => {
    try {
        let token;


        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }


        if (!token) return res.status(401).json({ message: "Not Authorized" });


        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");


        next();
    } catch (err) {
        res.status(401).json({ message: "Token Invalid" });
    }
};

export const superadminOnly = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) return res.status(401).json({ message: "Not Authorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (req.user.role !== "superadmin") {
            return res.status(403).json({ message: "Access Denied. Superadmin only." });
        }

        next();
    } catch (err) {
        res.status(401).json({ message: "Token Invalid" });
    }
};

