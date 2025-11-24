import merchantService from "../services/merchantService.js";

const merchantController = {
    getMerchantProducts: async (req, res) => {
        try {
            // Get pagination parameters from query
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const searchQuery = req.query.search || "";

            const result = await merchantService.getProducts(page, limit, searchQuery);

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