import merchantService from "../services/merchantService.js";

const merchantController = {
    getMerchantProducts: async (req, res) => {
        try {
            const products = await merchantService.getProducts();
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch products",
                error: error.message
            });
        }
    }
};

export default merchantController;
