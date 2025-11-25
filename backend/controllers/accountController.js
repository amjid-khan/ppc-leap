import Account from "../models/Account.js";
import User from "../models/User.js";

// Get all accounts for logged-in user
export const getUserAccounts = async (req, res) => {
    try {
        const userId = req.user._id;
        const accounts = await Account.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            accounts: accounts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch accounts",
            error: error.message,
        });
    }
};

// Add new account
export const addAccount = async (req, res) => {
    try {
        const { accountName, merchantId } = req.body;
        const userId = req.user._id;

        if (!accountName || !merchantId) {
            return res.status(400).json({
                success: false,
                message: "Account name and merchant ID are required",
            });
        }

        // Check if account already exists for this user
        const existingAccount = await Account.findOne({ userId, merchantId });
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: "Account with this merchant ID already exists",
            });
        }

        const account = await Account.create({
            accountName,
            merchantId,
            userId,
        });

        res.status(201).json({
            success: true,
            message: "Account added successfully",
            account: account,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Account with this merchant ID already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to add account",
            error: error.message,
        });
    }
};

// Update account
export const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountName, merchantId } = req.body;
        const userId = req.user._id;

        const account = await Account.findOne({ _id: id, userId });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found",
            });
        }

        // Check if merchantId is being changed and if it conflicts
        if (merchantId && merchantId !== account.merchantId) {
            const existingAccount = await Account.findOne({ userId, merchantId });
            if (existingAccount) {
                return res.status(400).json({
                    success: false,
                    message: "Account with this merchant ID already exists",
                });
            }
        }

        if (accountName) account.accountName = accountName;
        if (merchantId) account.merchantId = merchantId;

        await account.save();

        res.status(200).json({
            success: true,
            message: "Account updated successfully",
            account: account,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update account",
            error: error.message,
        });
    }
};

// Delete account
export const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const account = await Account.findOne({ _id: id, userId });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found",
            });
        }

        await Account.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete account",
            error: error.message,
        });
    }
};

// Get single account
export const getAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const account = await Account.findOne({ _id: id, userId });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found",
            });
        }

        res.status(200).json({
            success: true,
            account: account,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch account",
            error: error.message,
        });
    }
};

// Switch to an account (set as selected)
export const switchAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const account = await Account.findOne({ _id: id, userId });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found",
            });
        }

        // Update user's selected account
        const user = await User.findById(userId);
        user.selectedAccount = account._id;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Account switched successfully",
            account: account,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to switch account",
            error: error.message,
        });
    }
};

