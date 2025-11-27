import merchantService from "../services/merchantService.js";
import User from "../models/User.js";
import Account from "../models/Account.js";

const merchantController = {
    getMerchantProducts: async (req, res) => {
        try {
            // Get user with selected account
            const user = await User.findById(req.user._id).populate("selectedAccount");
            
            if (!user.selectedAccount) {
                return res.status(400).json({
                    success: false,
                    message: "No account selected. Please select an account first.",
                });
            }

            const merchantId = user.selectedAccount.merchantId;

            if (!merchantId) {
                return res.status(400).json({
                    success: false,
                    message: "Merchant ID not found in selected account",
                });
            }

            console.log(`[merchantController] Fetching products for merchantId: ${merchantId}`);

            // Get pagination parameters from query
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const searchQuery = req.query.search || "";

            const result = await merchantService.getProducts(merchantId, page, limit, searchQuery);

            console.log(`[merchantController] Returning ${result.products.length} products, total: ${result.total}`);

            res.status(200).json({
                success: true,
                data: result.products,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
            });
        } catch (error) {
            console.error("Error in merchantController.getMerchantProducts:", error);
            
            // Handle authentication errors specifically
            if (error.message && error.message.includes("Authentication failed")) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication failed with Google Merchant API",
                    error: error.message,
                    details: "Please check that the service account has access to this merchant account."
                });
            }
            
            res.status(500).json({
                success: false,
                message: "Failed to fetch products",
                error: error.message,
            });
        }
    },

    getMerchantStats: async (req, res) => {
        try {
            // Get user with selected account
            const user = await User.findById(req.user._id).populate("selectedAccount");
            
            if (!user.selectedAccount) {
                return res.status(400).json({
                    success: false,
                    message: "No account selected. Please select an account first.",
                });
            }

            const merchantId = user.selectedAccount.merchantId;

            // Get stats from merchant service
            const stats = await merchantService.getStats(merchantId);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error("Error in merchantController.getMerchantStats:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch stats",
                error: error.message,
            });
        }
    },
};

export default merchantController;