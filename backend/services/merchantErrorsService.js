import { google } from "googleapis";
import User from "../models/User.js";

// same code + different attributeName (e.g. age_group, gender) ko alag entries ke liye
// groupKey: code__attributeName jab attributeName ho, warna sirf code
const getGroupKey = (issue) => {
    const code = issue.code || "UNKNOWN";
    return issue.attributeName ? `${code}__${issue.attributeName}` : code;
};

// productInfo: { id, title, link } – ProductStatus se; agar na ho to sirf productCount update hoga
const addToGrouped = (groupedIssues, issue, productId, productInfo = null) => {
    const code = issue.code || "UNKNOWN";
    const groupKey = getGroupKey(issue);
    if (!groupedIssues[groupKey]) {
        groupedIssues[groupKey] = {
            code,
            attributeName: issue.attributeName || null,
            title: issue.description || issue.detail || issue.code || code,
            severity: issue.servability === "disapproved" ? "critical" : (issue.severity || "warning"),
            products: new Set(),
            productDetails: [],
            exampleDetail: issue.detail || "",
        };
    }
    const g = groupedIssues[groupKey];
    if (productInfo && !g.products.has(productId)) g.productDetails.push(productInfo);
    g.products.add(productId);
};

export const fetchMerchantErrors = async (user, merchantId) => {
    if (!user.googleAccessToken || !user.googleRefreshToken) {
        throw new Error("Missing Google tokens");
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
    });

    // Token refresh – expired token ki wajah se empty aa sakta tha
    auth.on("tokens", async (tokens) => {
        if (tokens.access_token) {
            try {
                const updatedUser = await User.findById(user._id);
                if (updatedUser) {
                    updatedUser.googleAccessToken = tokens.access_token;
                    if (tokens.refresh_token) updatedUser.googleRefreshToken = tokens.refresh_token;
                    if (tokens.expiry_date) updatedUser.googleTokenExpiry = new Date(tokens.expiry_date);
                    await updatedUser.save();
                    user.googleAccessToken = tokens.access_token;
                    if (tokens.refresh_token) user.googleRefreshToken = tokens.refresh_token;
                }
            } catch (err) {
                console.error("merchantErrors: token save error", err.message);
            }
        }
    });

    const content = google.content({ version: "v2.1", auth });
    const groupedIssues = {};
    const productIdsWithItemIssues = new Set();

    // -----------------------------
    // 1️⃣ Product-level issues (productstatuses)
    // destinations hata diya – ab Shopping + Free Listings, etc. sab destinations se issues aayenge
    // itemLevelIssues ProductStatus ke ROOT par hota hai, destinationStatuses ke andar nahi
    // -----------------------------
    let pageToken;
    do {
        const response = await content.productstatuses.list({
            merchantId,
            maxResults: 250,
            pageToken,
            // destinations na do – default = sare eligible destinations (Needs Attention dono jagah se)
        });

        const statuses = response.data?.resources || [];

        for (const status of statuses) {
            const pid = status.productId;
            const dests = status.destinationStatuses || [];
            const productInfo = { id: pid, title: status.title || "", link: status.link || "" };

            // (a) ROOT-level itemLevelIssues – yahi primary source hai
            const rootIssues = status.itemLevelIssues || [];
            for (const issue of rootIssues) {
                addToGrouped(groupedIssues, issue, pid, productInfo);
                productIdsWithItemIssues.add(pid);
            }

            // (b) Agar kisi destination ke andar bhi itemLevelIssues ho (kuch responses mein)
            for (const dest of dests) {
                const di = dest.itemLevelIssues || [];
                for (const issue of di) {
                    addToGrouped(groupedIssues, issue, pid, productInfo);
                    productIdsWithItemIssues.add(pid);
                }
            }

            // (c) Disapproved/Pending jinke paas itemLevelIssue nahi – generic bucket
            if (!productIdsWithItemIssues.has(pid)) {
                for (const dest of dests) {
                    const s = (dest.status || "").toLowerCase();
                    if (s === "disapproved") {
                        if (!groupedIssues["DISAPPROVED"]) {
                            groupedIssues["DISAPPROVED"] = {
                                code: "DISAPPROVED",
                                title: "Disapproved product",
                                severity: "critical",
                                products: new Set(),
                                productDetails: [],
                                exampleDetail: "Product is disapproved for this destination.",
                            };
                        }
                        groupedIssues["DISAPPROVED"].products.add(pid);
                        groupedIssues["DISAPPROVED"].productDetails.push(productInfo);
                        break;
                    }
                    if (s === "pending") {
                        if (!groupedIssues["PENDING"]) {
                            groupedIssues["PENDING"] = {
                                code: "PENDING",
                                title: "Pending review",
                                severity: "warning",
                                products: new Set(),
                                productDetails: [],
                                exampleDetail: "Product is pending review for this destination.",
                            };
                        }
                        groupedIssues["PENDING"].products.add(pid);
                        groupedIssues["PENDING"].productDetails.push(productInfo);
                        break;
                    }
                }
            }
        }

        pageToken = response.data?.nextPageToken;
    } while (pageToken);

    // -----------------------------
    // 2️⃣ Account-level issues (agar API support kare)
    // -----------------------------
    try {
        const accountResponse = await content.accounts.get({
            merchantId,
            accountId: merchantId,
        });
        const accountIssues = accountResponse.data?.issues || [];
        for (const issue of accountIssues) {
            if (!groupedIssues[issue.code]) {
                groupedIssues[issue.code] = {
                    code: issue.code,
                    title: issue.detail || issue.description || issue.code,
                    severity: issue.severity || "critical",
                    products: new Set(),
                    productDetails: [],
                    exampleDetail: issue.detail || "",
                };
            }
            // account-level ka productId nahi hota, isliye productCount 0 hi rahega
        }
    } catch (e) {
        // accountId alag ho sakta hai ya Account resource par issues na ho
        // ignore
    }

    // -----------------------------
    // 3️⃣ UI-ready response
    // -----------------------------
    return Object.values(groupedIssues).map((issue) => ({
        code: issue.code,
        ...(issue.attributeName && { attributeName: issue.attributeName }),
        title: issue.title,
        severity: issue.severity,
        productCount: issue.products.size,
        impact:
            issue.products.size < 5 ? "Low impact" : issue.products.size < 20 ? "Medium impact" : "High impact",
        exampleDetail: issue.exampleDetail,
        products: issue.productDetails || [],
    }));
};
