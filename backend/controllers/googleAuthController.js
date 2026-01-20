import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { fetchGoogleMerchantAccounts } from "../services/googleMerchantService.js";

// Redirect user to Google for login
export const googleLoginRedirect = passport.authenticate("google", {
    scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/content"
    ],
    accessType: "offline",
    prompt: "consent"
});

// Callback after Google login
export const googleLoginCallback = async (req, res) => {
    try {
        const user = req.user;

        console.log(`\n========== GOOGLE LOGIN CALLBACK START ==========`);
        console.log(`User: ${user.email}`);
        console.log(`User ID: ${user._id}`);
        console.log(`Google ID: ${user.googleId}`);
        console.log(`Has googleAccessToken: ${!!user.googleAccessToken}`);
        console.log(`Has googleRefreshToken: ${!!user.googleRefreshToken}`);
        console.log(`Token expiry: ${user.googleTokenExpiry}`);

        // Verify tokens exist before fetching accounts
        if (!user.googleAccessToken || !user.googleRefreshToken) {
            console.error(`❌ Missing required Google tokens!`);
            console.error(`   Access Token: ${!!user.googleAccessToken}`);
            console.error(`   Refresh Token: ${!!user.googleRefreshToken}`);
            return res.redirect(`${process.env.CLIENT_URL}/login?error=missing_tokens`);
        }

        // Fetch merchant accounts linked to this email
        console.log(`\nAttempting to fetch merchant accounts for ${user.email}...`);
        const accounts = await fetchGoogleMerchantAccounts(user);
        console.log(`✅ Fetched ${accounts.length} merchant accounts for ${user.email}`);

        if (accounts.length === 0) {
            console.warn(`⚠️ No merchant accounts found for ${user.email}`);
            console.warn(`User may need to link a Google Merchant Center account`);
        }

        // Reload user from database to get updated data
        const updatedUser = await User.findById(user._id);
        console.log(`\nDatabase verification:`);
        console.log(`  Accounts in DB: ${updatedUser.googleMerchantAccounts.length}`);
        console.log(`  Selected Account: ${updatedUser.selectedAccount}`);
        console.log(`  Email: ${updatedUser.email}`);

        const token = jwt.sign(
            {
                id: updatedUser._id,
                email: updatedUser.email,
                selectedAccount: updatedUser.selectedAccount
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return token with merchant account info
        const callbackUrl = `${process.env.CLIENT_URL}/admin?token=${token}`;
        console.log(`\n✅ Login successful for ${user.email}`);
        console.log(`Redirecting to: ${callbackUrl}`);
        console.log(`========== GOOGLE LOGIN CALLBACK END ==========\n`);

        return res.redirect(callbackUrl);
    } catch (error) {
        console.error(`\n❌ Google Auth Callback Error:`);
        console.error(`   Error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        console.error(`========== GOOGLE LOGIN CALLBACK ERROR END ==========\n`);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
    }
};

// Get all merchant accounts for the logged-in user
export const getMerchantAccounts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            accounts: user.googleMerchantAccounts,
            selectedAccount: user.selectedAccount,
            email: user.email
        });
    } catch (error) {
        console.error("Error fetching merchant accounts:", error.message);
        res.status(500).json({ error: "Failed to fetch merchant accounts" });
    }
};

// Select a specific merchant account for the logged-in user
export const selectMerchantAccount = async (req, res) => {
    try {
        const { merchantId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify account exists in user's accounts
        const selectedAcc = user.googleMerchantAccounts.find(acc => acc.id === merchantId);

        if (!selectedAcc) {
            return res.status(400).json({ error: "Merchant account not found" });
        }

        user.selectedAccount = merchantId;
        await user.save();

        res.json({
            success: true,
            message: "Account selected successfully",
            selectedAccount: {
                merchantId: selectedAcc.id,
                accountName: selectedAcc.name,
                websiteUrl: selectedAcc.websiteUrl,
                email: selectedAcc.email,
                businessType: selectedAcc.businessType,
                status: selectedAcc.status
            }
        });
    } catch (error) {
        console.error("Error selecting merchant account:", error.message);
        res.status(500).json({ error: "Failed to select merchant account" });
    }
};
