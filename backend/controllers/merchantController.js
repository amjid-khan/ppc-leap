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

            // Get pagination parameters from query
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const searchQuery = req.query.search || "";

            const result = await merchantService.getProducts(merchantId, page, limit, searchQuery);

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
            res.status(500).json({
                success: false,
                message: "Failed to fetch products",
                error: error.message,
            });
        }
    },
};

export default merchantController;