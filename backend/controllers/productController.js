import User from "../models/User.js";
import { fetchGoogleMerchantProducts } from "../services/googleMerchantService.js";

export const getMerchantProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const merchantId = user.selectedAccount;

        if (!merchantId) {
            return res.status(400).json({ error: "No merchant account selected" });
        }

        console.log(`📦 Fetching products for user ${user.email}, merchant ${merchantId}`);

        // Ensure user has valid Google tokens
        if (!user.googleAccessToken || !user.googleRefreshToken) {
            console.error(`❌ Missing Google tokens for user ${user.email}. Requires re-authentication.`);
            return res.status(401).json({
                error: "Missing Google credentials. Please login again with Google.",
                requiresReauth: true
            });
        }

        const allProducts = await fetchGoogleMerchantProducts(user, merchantId);

        const paginatedProducts = allProducts.slice(offset, offset + limit);

        return res.json({
            merchantId,
            page,
            limit,
            total: allProducts.length,
            products: paginatedProducts
        });
    } catch (error) {
        console.error("Error in getMerchantProducts:", error.message);
        return res.status(500).json({
            error: "Failed to fetch products",
            details: error.message
        });
    }
};