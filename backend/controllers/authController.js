import User from "../models/User.js";
import { generateToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { fetchGoogleMerchantProducts } from "../services/googleMerchantService.js";

const formatUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    image: user.googlePicture || null, // Map googlePicture to image for frontend
    selectedAccount: user.selectedAccount || null,
});

// REGISTER

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // 🔐 CHECK IF SUPERADMIN EXISTS
        const superAdminExists = await User.findOne({ role: "superadmin" });

        const user = await User.create({
            name,
            email,
            password,
            role: superAdminExists ? "user" : "superadmin"
        });

        const token = generateToken(user._id);
        user.authToken = token;
        await user.save();

        res.status(201).json({
            message: "User Registered",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token: token,
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

        const token = generateToken(user._id);

        // Save token in database
        user.authToken = token;
        await user.save();

        res.json({
            message: "Login Successful",
            user: formatUserResponse(user),
            token: token,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        // superadmin ko hi query me exclude kar diya
        const users = await User.find({ role: { $ne: 'superadmin' } });

        const usersWithAccounts = users.map(user => {
            const userObj = user.toObject ? user.toObject() : {};

            const accountsWithProductCount = (userObj.googleMerchantAccounts || []).map(account => ({
                ...account,
                productCount: account.productCount || 0
            }));

            return {
                ...userObj,
                googleMerchantAccounts: accountsWithProductCount
            };
        });

        res.status(200).json(usersWithAccounts);

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET ALL ACCOUNTS WITH PRODUCT COUNTS FROM DB (FAST - No API calls)
export const getAllAccounts = async (req, res) => {
    try {
        const users = await User.find().select('name email googleMerchantAccounts');

        const groupedByEmail = {};

        for (const user of users) {
            if (user.googleMerchantAccounts && user.googleMerchantAccounts.length > 0) {

                // Create email group if not exists
                if (!groupedByEmail[user.email]) {
                    groupedByEmail[user.email] = {
                        userEmail: user.email || "N/A",
                        userId: user._id.toString(),
                        userName: user.name || "N/A",
                        accounts: []
                    };
                }

                for (const account of user.googleMerchantAccounts) {
                    const accountObj = account.toObject
                        ? account.toObject()
                        : (typeof account === 'object' ? account : {});

                    groupedByEmail[user.email].accounts.push({
                        id: accountObj.id || accountObj._id || null,
                        name: accountObj.name || "Unnamed Account",
                        email: accountObj.email || "",
                        websiteUrl: accountObj.websiteUrl || "",
                        productCount: accountObj.productCount || 0,
                        productCountUpdatedAt: accountObj.productCountUpdatedAt || null
                    });
                }
            }
        }

        // Convert object to array
        const result = Object.values(groupedByEmail);

        res.status(200).json(result);

    } catch (error) {
        console.error("Error fetching accounts:", error);
        res.status(500).json({ message: error.message });
    }
};


// GET PRODUCT COUNT FOR SPECIFIC ACCOUNT
export const getProductCount = async (req, res) => {
    try {
        const { userId, merchantId } = req.query;

        if (!userId || !merchantId) {
            return res.status(400).json({ message: "userId and merchantId are required" });
        }

        // Find user by ID (mongoose handles ObjectId conversion automatically)
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User not found with userId: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        // Check if account exists for this user
        const account = user.googleMerchantAccounts.find(acc => acc.id === merchantId);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Start with cached product count from DB
        let productCount = account.productCount || 0;
        const cachedCount = account.productCount || 0;

        console.log(`[${new Date().toISOString()}] Getting product count for merchant ${merchantId} (user: ${user.email})`);
        console.log(`Cached count in DB: ${cachedCount}`);

        // Try to fetch fresh product count, but preserve cached if fetch fails
        try {
            if (user.googleAccessToken && user.googleRefreshToken) {
                const products = await fetchGoogleMerchantProducts(user, merchantId);
                const freshCount = Array.isArray(products) ? products.length : 0;

                console.log(`Fresh fetch returned: ${freshCount} products`);

                // Only update if:
                // 1. Fresh count > 0 (we got valid data), OR
                // 2. Cached count is 0 (no previous data, use fresh even if 0)
                if (freshCount > 0) {
                    // Got valid fresh data - use it
                    productCount = freshCount;
                    console.log(`[${new Date().toISOString()}] ✅ Using fresh count ${productCount} for merchant ${merchantId}`);

                    // Update product count in DB
                    const accIndex = user.googleMerchantAccounts.findIndex(acc => acc.id === merchantId);
                    if (accIndex !== -1) {
                        user.googleMerchantAccounts[accIndex].productCount = productCount;
                        user.googleMerchantAccounts[accIndex].productCountUpdatedAt = new Date();
                        await user.save();
                        console.log(`[${new Date().toISOString()}] 💾 Updated product count ${productCount} in DB for merchant ${merchantId}`);
                    }
                } else if (cachedCount === 0) {
                    // No cached data, fresh returned 0 - use 0 (might actually be 0 products)
                    productCount = 0;
                    console.log(`[${new Date().toISOString()}] Using fresh count 0 (no cached data) for merchant ${merchantId}`);
                } else {
                    // Fresh returned 0 but we have cached count > 0 - preserve cached (likely auth error)
                    productCount = cachedCount;
                    console.log(`[${new Date().toISOString()}] ⚠️ Fresh fetch returned 0, preserving cached count ${cachedCount} for merchant ${merchantId} (possible auth issue)`);
                }
            } else {
                console.log(`⚠️ No Google tokens for user ${user.email}, using cached count: ${productCount}`);
            }
        } catch (err) {
            // Check if it's an authentication error
            const isAuthError = err.message?.includes('invalid_grant') ||
                err.message?.includes('unauthorized') ||
                err.message?.includes('invalid_request') ||
                err.code === 401 ||
                err.response?.status === 401;

            if (isAuthError) {
                console.error(`❌ Authentication error for account ${merchantId} (user: ${user.email}). Preserving cached count: ${cachedCount}`);
                // Preserve cached count - don't overwrite with 0
                productCount = cachedCount;
            } else {
                console.error(`❌ Error fetching products for account ${merchantId} (user: ${user.email}):`, err.message);
                // Keep using cached count if fetch fails
                productCount = cachedCount;
            }
        }

        console.log(`[${new Date().toISOString()}] Returning product count: ${productCount} for merchant ${merchantId}`);
        // Return the product count (either fresh or cached)
        res.status(200).json({ productCount });
    } catch (error) {
        console.error("Error getting product count:", error);
        res.status(500).json({ message: error.message });
    }
};

// VERIFY TOKEN
export const verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith("Bearer")
            ? authHeader.split(" ")[1]
            : null;

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            user: formatUserResponse(user),
        });
    } catch (err) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};