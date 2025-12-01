import express from "express";
import passport from "passport";
import { googleAuthCallback, googleAuthFailure } from "../controllers/googleAuthController.js";

const router = express.Router();

// Initiates Google login (only request basic scopes to avoid sensitive-scope verification)
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

// Callback endpoint that issues JWT and redirects to client
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/auth/google/failure" }),
    googleAuthCallback
);

router.get("/google/failure", googleAuthFailure);

export default router;
