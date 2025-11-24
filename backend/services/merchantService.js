import { google } from "googleapis";
import auth from "../config/googleAuth.js";

// In-memory cache for products
let productsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const merchantService = {
    // Get total count (quick method)
    getTotalCount: async () => {
        try {
            const authClient = await auth.getClient();
            const content = google.content({ version: "v2.1", auth: authClient });
            const merchantId = "5400577233";

            // Quick count - fetch first page only
            const res = await content.products.list({
                merchantId,
                maxResults: 1,
            });

            // Google API doesn't provide total count directly
            // We'll need to estimate or fetch all for accurate count
            return null;
        } catch (error) {
            throw error;
        }
    },

    // Get products with pagination
    getProducts: async (page = 1, limit = 50, searchQuery = "") => {
        try {
            // Check if cache is valid
            const now = Date.now();
            if (!productsCache || !cacheTimestamp || (now - cacheTimestamp) > CACHE_DURATION) {
                // Cache expired or doesn't exist, fetch fresh data
                const authClient = await auth.getClient();
                const content = google.content({ version: "v2.1", auth: authClient });
                const merchantId = "5400577233";

                let allProducts = [];
                let pageToken = null;

                // Fetch all products from Google API
                do {
                    const res = await content.products.list({
                        merchantId,
                        maxResults: 250,
                        pageToken: pageToken || undefined,
                    });

                    if (res.data && res.data.resources) {
                        allProducts = [...allProducts, ...res.data.resources];
                    }

                    pageToken = res.data?.nextPageToken;
                } while (pageToken);

                if (allProducts.length === 0) {
                    productsCache = [];
                    cacheTimestamp = now;
                    return {
                        products: [],
                        total: 0,
                        page: page,
                        limit: limit,
                        totalPages: 0
                    };
                }

                // Fetch product statuses using productstatuses.list() - this gets statuses for all products
                const productStatuses = new Map();
                try {
                    let statusPageToken = null;
                    do {
                        const statusRes = await content.productstatuses.list({
                            merchantId,
                            maxResults: 250,
                            pageToken: statusPageToken || undefined,
                        });

                        if (statusRes.data && statusRes.data.resources) {
                            statusRes.data.resources.forEach(ps => {
                                if (ps.productId) {
                                    productStatuses.set(ps.productId, ps);
                                }
                            });
                        }
                        statusPageToken = statusRes.data?.nextPageToken;
                    } while (statusPageToken);
                } catch (err) {
                    // Continue without statuses if fetch fails
                }

                // Map products for frontend - check list response and statuses
                const formattedProducts = allProducts.map((p) => {
                    // Get productType - check in list response (these fields may not be in list response)
                    let productType = null;
                    if (p.productType !== undefined && p.productType !== null && p.productType !== '') {
                        productType = Array.isArray(p.productType)
                            ? (p.productType.length > 0 ? p.productType.join(" > ") : null)
                            : (typeof p.productType === 'string' && p.productType.trim() !== '' ? p.productType : null);
                    }

                    // Get googleProductCategory - check in list response
                    let googleCategory = null;
                    if (p.googleProductCategory !== undefined && p.googleProductCategory !== null && p.googleProductCategory !== '') {
                        googleCategory = Array.isArray(p.googleProductCategory)
                            ? (p.googleProductCategory.length > 0 ? p.googleProductCategory.join(" > ") : null)
                            : (typeof p.googleProductCategory === 'string' && p.googleProductCategory.trim() !== '' ? p.googleProductCategory : null);
                    }

                    // Try to get these from product status if available
                    const productStatus = productStatuses.get(p.id);
                    if (productStatus && productStatus.product) {
                        const prod = productStatus.product;
                        if (!productType && prod.productType) {
                            productType = Array.isArray(prod.productType) ? prod.productType.join(" > ") : prod.productType;
                        }
                        if (!googleCategory && prod.googleProductCategory) {
                            googleCategory = Array.isArray(prod.googleProductCategory) ? prod.googleProductCategory.join(" > ") : prod.googleProductCategory;
                        }
                    }

                    // Get status from productStatuses map or from product data
                    let status = null;

                    // Check in fetched product statuses (reuse productStatus from above)
                    if (productStatus) {
                        if (productStatus.destinationStatuses && Array.isArray(productStatus.destinationStatuses) && productStatus.destinationStatuses.length > 0) {
                            const shoppingStatus = productStatus.destinationStatuses.find(ds =>
                                ds.destination === 'Shopping ads' || ds.destination === 'Shopping' || ds.destination === 'shopping_ads'
                            );
                            const firstStatus = productStatus.destinationStatuses[0];
                            const statusObj = shoppingStatus || firstStatus;
                            if (statusObj) {
                                status = statusObj.status || statusObj.approvalStatus || null;
                            }
                        }

                        // Check itemLevelIssues for status
                        if (!status && productStatus.itemLevelIssues && Array.isArray(productStatus.itemLevelIssues) && productStatus.itemLevelIssues.length > 0) {
                            const hasError = productStatus.itemLevelIssues.some(issue => issue.severity === "error" || issue.severity === "critical");
                            if (hasError) {
                                status = "disapproved";
                            } else {
                                status = "pending";
                            }
                        }
                    }

                    // Fallback: Check in product data itself
                    if (!status && p.destinationStatuses && Array.isArray(p.destinationStatuses) && p.destinationStatuses.length > 0) {
                        const shoppingStatus = p.destinationStatuses.find(ds =>
                            ds.destination === 'Shopping ads' || ds.destination === 'Shopping'
                        );
                        status = (shoppingStatus || p.destinationStatuses[0])?.status || null;
                    }

                    // Get disapproval reasons if any
                    let disapprovalReasons = [];
                    if (p.itemLevelIssue) {
                        if (p.itemLevelIssue.attribute) {
                            disapprovalReasons.push(p.itemLevelIssue.attribute);
                        }
                        if (p.itemLevelIssue.description) {
                            disapprovalReasons.push(p.itemLevelIssue.description);
                        }
                    }
                    if (p.itemLevelIssues && Array.isArray(p.itemLevelIssues)) {
                        disapprovalReasons = p.itemLevelIssues
                            .map(issue => issue.attribute || issue.description || issue.reason)
                            .filter(Boolean);
                    }

                    return {
                        id: p.id || "-",
                        title: p.title || "-",
                        imageLink: p.imageLink || "https://via.placeholder.com/60",
                        description: p.description || "-",
                        brand: p.brand || "-",
                        feedLabel: p.feedLabel || "-",
                        productType: productType || "-",
                        googleCategory: googleCategory || "-",
                        status: status || "unknown",
                        availability: p.availability || "unknown",
                        disapprovalReasons: disapprovalReasons
                    };
                });

                // Store in cache
                productsCache = formattedProducts;
                cacheTimestamp = now;
            }

            // Get products from cache
            let filteredProducts = [...productsCache];

            // Apply search filter if provided
            if (searchQuery && searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                filteredProducts = filteredProducts.filter((p) =>
                    p.title?.toLowerCase().includes(query) ||
                    p.description?.toLowerCase().includes(query) ||
                    p.brand?.toLowerCase().includes(query) ||
                    p.id?.toLowerCase().includes(query)
                );
            }

            // Calculate pagination
            const total = filteredProducts.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

            return {
                products: paginatedProducts,
                total: total,
                page: page,
                limit: limit,
                totalPages: totalPages
            };

        } catch (error) {
            // Only log errors, not all the fetching process
            if (error.response) {
                throw new Error(`Google API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.message) {
                throw new Error(`Failed to fetch products: ${error.message}`);
            } else {
                throw new Error("Failed to fetch products from Google API - Unknown error");
            }
        }
    },
};

export default merchantService;