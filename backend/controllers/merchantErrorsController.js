import { fetchMerchantErrors } from "../services/merchantErrorsService.js";

export const getMerchantErrors = async (req, res) => {
    try {
        const user = req.user;
        const { merchantId } = req.params;

        if (!merchantId) {
            return res.status(400).json({ message: "merchantId is required" });
        }

        const errors = await fetchMerchantErrors(user, merchantId);

        res.json({
            merchantId,
            totalIssues: errors.length,
            needsAttention: errors,
        });
    } catch (error) {
        console.error("Merchant Errors Controller:", error.message);
        res.status(500).json({
            message: "Failed to fetch merchant errors",
            error: error.message,
        });
    }
};
