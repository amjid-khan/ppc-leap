import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export default function setupPassport() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    console.log(`\n🔐 Google OAuth Strategy - Processing user: ${email}`);
                    console.log(`   Google ID: ${profile.id}`);
                    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
                    console.log(`   Refresh Token: ${refreshToken ? 'YES (New)' : 'Will use existing'}`);

                    let user = await User.findOne({ googleId: profile.id });

                    if (!user) {
                        console.log(`   → Creating NEW user for ${email}`);
                        user = await User.create({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: email,
                            googlePicture: profile.photos?.[0]?.value || null,
                        });
                        console.log(`   ✓ User created: ${user._id}`);
                    } else {
                        console.log(`   → Existing user found: ${user._id}`);
                    }

                    // Always update tokens on login
                    const oldAccessToken = user.googleAccessToken;
                    user.googleAccessToken = accessToken;

                    if (refreshToken) {
                        user.googleRefreshToken = refreshToken;
                        console.log(`   ✓ Updated refresh token`);
                    } else {
                        console.log(`   ℹ️ No refresh token provided - keeping existing one`);
                    }

                    // Set token expiry (typically expires in 1 hour)
                    user.googleTokenExpiry = new Date(Date.now() + 3600 * 1000);

                    await user.save();
                    console.log(`   ✓ Saved user with updated tokens`);
                    console.log(`   ✓ User email: ${user.email}`);
                    console.log(`   ✓ Google ID: ${user.googleId}\n`);

                    done(null, user);
                } catch (err) {
                    console.error(`❌ Passport Google Strategy Error:`, err.message);
                    done(err, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}