import User from "../models/User.js";
import { fetchGoogleMerchantProducts } from "../services/googleMerchantService.js";

export const getMerchantProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // 50 per page
    const offset = (page - 1) * limit;

    const user = await User.findById(req.user.id);
    const merchantId = user.selectedAccount;

    const allProducts = await fetchGoogleMerchantProducts(user, merchantId);

    const paginatedProducts = allProducts.slice(offset, offset + limit);

    return res.json({
        merchantId,
        page,
        limit,
        total: allProducts.length,
        products: paginatedProducts
    });
};
