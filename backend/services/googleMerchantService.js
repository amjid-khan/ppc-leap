import { google } from "googleapis";
import User from "../models/User.js";

// Helper function to fetch product count asynchronously
const fetchProductCountAsync = async (user, merchantId) => {
    try {
        if (!user.googleAccessToken || !user.googleRefreshToken) {
            return 0;
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        auth.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken,
        });

        const content = google.content({ version: "v2.1", auth });

        // Just count products without fetching all details
        let totalCount = 0;
        let pageToken = undefined;
        do {
            try {
                const requestParams = {
                    merchantId: merchantId,
                    maxResults: 250,
                };
                if (pageToken) requestParams.pageToken = pageToken;

                const response = await content.products.list(requestParams);
                const products = response.data.resources || [];
                totalCount += products.length;
                pageToken = response.data.nextPageToken;
            } catch (pageError) {
                console.error(`Error counting products for ${merchantId}:`, pageError.message);
                break;
            }
        } while (pageToken);

        console.log(`Product count for ${merchantId}: ${totalCount}`);
        return totalCount;
    } catch (error) {
        console.error(`Error fetching product count for ${merchantId}:`, error.message);
        return 0;
    }
};

// FETCH MERCHANT ACCOUNTS
export const fetchGoogleMerchantAccounts = async (user) => {
    try {
        if (!user.googleAccessToken || !user.googleRefreshToken) {
            console.error("Missing Google tokens for:", user.email);
            return [];
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        auth.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken,
        });

        // Handle token refresh automatically
        auth.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                try {
                    const updatedUser = await User.findById(user._id);
                    if (updatedUser) {
                        updatedUser.googleAccessToken = tokens.access_token;
                        if (tokens.refresh_token) {
                            updatedUser.googleRefreshToken = tokens.refresh_token;
                        }
                        if (tokens.expiry_date) {
                            updatedUser.googleTokenExpiry = new Date(tokens.expiry_date);
                        }
                        await updatedUser.save();
                        console.log(`✅ Refreshed Google token for user ${user.email}`);
                        user.googleAccessToken = tokens.access_token;
                        if (tokens.refresh_token) {
                            user.googleRefreshToken = tokens.refresh_token;
                        }
                    }
                } catch (err) {
                    console.error(`Error saving refreshed token:`, err.message);
                }
            }
        });

        const content = google.content({ version: "v2.1", auth });

        console.log(`Fetching ALL merchant accounts for: ${user.email}`);

        // STEP 1: Get list of merchant accounts linked to this Google Account
        const authInfo = await content.accounts.authinfo();
        const identifiers = authInfo.data.accountIdentifiers || [];

        console.log("Merchant Identifiers found:", identifiers);

        const accounts = [];

        // STEP 2: Loop through all merchantIds
        for (const acc of identifiers) {
            if (!acc.merchantId) continue;

            try {
                const response = await content.accounts.get({
                    merchantId: acc.merchantId,
                    accountId: acc.merchantId
                });

                const account = response.data;

                // Get existing account from DB if exists to preserve product count
                const existingAccount = user.googleMerchantAccounts?.find(acc => acc.id === account.id);
                let productCount = existingAccount?.productCount || 0;
                let productCountUpdatedAt = existingAccount?.productCountUpdatedAt || null;

                // Check if product count needs to be updated (more than 24 hours old or doesn't exist)
                const shouldUpdateCount = !productCountUpdatedAt || 
                    (Date.now() - new Date(productCountUpdatedAt).getTime() > 24 * 60 * 60 * 1000);

                // Fetch product count in background (async, non-blocking) if needed
                if (shouldUpdateCount) {
                    fetchProductCountAsync(user, account.id).then(count => {
                        // Update product count in DB asynchronously
                        User.findById(user._id).then(updatedUser => {
                            if (updatedUser) {
                                const accIndex = updatedUser.googleMerchantAccounts.findIndex(acc => acc.id === account.id);
                                if (accIndex !== -1) {
                                    updatedUser.googleMerchantAccounts[accIndex].productCount = count;
                                    updatedUser.googleMerchantAccounts[accIndex].productCountUpdatedAt = new Date();
                                    updatedUser.save().catch(err => console.error("Error updating product count:", err));
                                }
                            }
                        }).catch(err => console.error("Error finding user for product count update:", err));
                    }).catch(err => console.error("Error fetching product count async:", err));
                }

                accounts.push({
                    id: account.id,
                    name: account.name || "Unnamed Account",
                    email: account.businessInformation?.customerService?.email || user.email,
                    websiteUrl: account.websiteUrl || "",
                    businessType: account.accountManagement || "unknown",
                    adultContent: account.adultContent || false,
                    status: account.adsLinks?.[0]?.status || "unknown",
                    reviewStatus: account.reviewStatus || "",
                    productCount: productCount,
                    productCountUpdatedAt: productCountUpdatedAt,
                    businessAddress: account.businessInformation?.address || {},
                    phoneNumber: account.businessInformation?.phoneNumber || "",
                    customerService: account.businessInformation?.customerService || {},
                });

                console.log("Fetched account:", account.id);

            } catch (err) {
                console.error(`Error fetching merchant ${acc.merchantId}:`, err.message);
            }
        }

        console.log(`Total merchant accounts fetched: ${accounts.length}`);

        // Save to DB
        user.googleMerchantAccounts = accounts;

        // Set default selected account
        if (!user.selectedAccount && accounts.length > 0) {
            user.selectedAccount = accounts[0].id;
        }

        await user.save();
        console.log(`Saved ${accounts.length} accounts for: ${user.email}`);

        return accounts;

    } catch (error) {
        console.error("ERROR in fetchGoogleMerchantAccounts:", error.message);
        return [];
    }
};


// FETCH PRODUCTS
export const fetchGoogleMerchantProducts = async (user, merchantId) => {
    try {
        if (!user.googleAccessToken || !user.googleRefreshToken) {
            console.error("Missing Google tokens for:", user.email);
            return [];
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        auth.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken,
        });

        // Handle token refresh automatically
        auth.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                try {
                    const updatedUser = await User.findById(user._id);
                    if (updatedUser) {
                        updatedUser.googleAccessToken = tokens.access_token;
                        if (tokens.refresh_token) {
                            updatedUser.googleRefreshToken = tokens.refresh_token;
                        }
                        if (tokens.expiry_date) {
                            updatedUser.googleTokenExpiry = new Date(tokens.expiry_date);
                        }
                        await updatedUser.save();
                        console.log(`✅ Refreshed Google token for user ${user.email}`);
                        user.googleAccessToken = tokens.access_token;
                        if (tokens.refresh_token) {
                            user.googleRefreshToken = tokens.refresh_token;
                        }
                    }
                } catch (err) {
                    console.error(`Error saving refreshed token:`, err.message);
                }
            }
        });

        const content = google.content({ version: "v2.1", auth });

        console.log(`Fetching ALL PRODUCTS for merchant: ${merchantId}`);

        // 1) Fetch product "data" (title, price, image, etc.)
        const allProducts = [];
        let pageToken = undefined;
        do {
            try {
                const requestParams = {
                    merchantId: merchantId,
                    maxResults: 250,
                };

                if (pageToken) requestParams.pageToken = pageToken;

                const response = await content.products.list(requestParams);
                const products = response.data.resources || [];

                console.log(`Fetched batch: ${products.length} products`);
                allProducts.push(...products);
                pageToken = response.data.nextPageToken;
            } catch (pageError) {
                // Check if it's an auth error
                if (pageError.message?.includes('invalid_grant') || pageError.message?.includes('unauthorized')) {
                    console.error(`⚠️ Authentication error (invalid_grant/unauthorized) for ${merchantId}. User may need to re-authenticate.`);
                    // Try to refresh token if possible
                    try {
                        await auth.refreshAccessToken();
                        // Retry once after refresh
                        continue;
                    } catch (refreshError) {
                        console.error(`❌ Token refresh failed for ${merchantId}:`, refreshError.message);
                        break;
                    }
                } else {
                    console.error(`Page error for ${merchantId}:`, pageError.message);
                    break;
                }
            }
        } while (pageToken);

        // 2) Fetch product "status" (includes disapproved/pending info)
        const allStatuses = [];
        let statusPageToken = undefined;
        do {
            try {
                const statusParams = {
                    merchantId: merchantId,
                    maxResults: 250,
                };
                if (statusPageToken) statusParams.pageToken = statusPageToken;

                const statusResp = await content.productstatuses.list(statusParams);
                const statuses = statusResp.data.resources || [];
                console.log(`Fetched status batch: ${statuses.length} products`);
                allStatuses.push(...statuses);
                statusPageToken = statusResp.data.nextPageToken;
            } catch (statusErr) {
                console.error(`Status page error: ${statusErr.message}`);
                break;
            }
        } while (statusPageToken);

        console.log(
            `Total ${allProducts.length} products + ${allStatuses.length} statuses fetched from merchant ${merchantId}`
        );

        const inferApprovalFromStatus = (statusResource) => {
            // destinationStatuses[].status is commonly one of: "approved", "disapproved", "pending"
            const dest = statusResource?.destinationStatuses || [];
            const statuses = dest.map((d) => String(d.status || "").toLowerCase()).filter(Boolean);
            if (statuses.includes("disapproved")) return "disapproved";
            if (statuses.includes("pending")) return "pending";
            if (statuses.includes("approved")) return "approved";

            // Fallback: if itemLevelIssues exist, treat as pending/disapproved depending on severity
            if (Array.isArray(statusResource?.itemLevelIssues) && statusResource.itemLevelIssues.length > 0) {
                const critical = statusResource.itemLevelIssues.some((i) => String(i.severity || "").toLowerCase() === "critical");
                return critical ? "disapproved" : "pending";
            }
            return "approved";
        };

        const extractOfferIdFromProductId = (productId) => {
            // productId often looks like: channel:contentLanguage:targetCountry:offerId
            if (!productId) return null;
            const parts = String(productId).split(":");
            return parts.length ? parts[parts.length - 1] : String(productId);
        };

        const productById = new Map(allProducts.map((p) => [p.id, p]));
        const statusById = new Map(allStatuses.map((s) => [s.productId, s]));

        // Union of ids from both sources so disapproved items (present in statuses) also show up
        const allIds = new Set([...productById.keys(), ...statusById.keys()]);

        const merged = [];
        for (const id of allIds) {
            const p = productById.get(id);
            const s = statusById.get(id);

            const approvalStatus = s ? inferApprovalFromStatus(s) : (p?.approvalStatus ? String(p.approvalStatus).toLowerCase() : "approved");

            // Prefer product fields when available; otherwise fall back to status fields
            const offerId = p?.offerId || extractOfferIdFromProductId(s?.productId) || null;

            merged.push({
                id: p?.id || s?.productId || id,
                title: p?.title || s?.title || "",
                link: p?.link || s?.link || "",
                imageLink: p?.imageLink || "",
                price: p?.price,
                salePrice: p?.salePrice,
                availability: p?.availability,
                brand: p?.brand,
                gtin: p?.gtin,
                condition: p?.condition,
                productType: p?.productType,
                customLabel0: p?.customLabel0,
                channel: p?.channel,
                offerId,
                approvalStatus,
                // keep raw for existing UI usage (description, etc.)
                raw: p || { productstatus: s },
            });
        }

        return merged;
    } catch (error) {
        // Check if it's an auth error
        const isAuthError = error.message?.includes('invalid_grant') || 
                           error.message?.includes('unauthorized') ||
                           error.code === 401;
        
        if (isAuthError) {
            console.error(`❌ Authentication error (invalid_grant/unauthorized) for merchant ${merchantId}. User ${user.email} may need to re-authenticate with Google.`);
            console.error(`Error:`, error.message);
            // Return empty array - controller will use cached count
            // Don't overwrite cached count with 0
            return [];
        } else {
            console.error(`Error fetching products for merchant ${merchantId}:`, error.message);
            console.error(`Full error:`, error);
            return [];
        }
    }
};

