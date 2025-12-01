import jwt from "jsonwebtoken";

// Redirect handler is handled by passport in the route; this file provides callback and failure handlers.
export const googleAuthCallback = (req, res) => {
	try {
		if (!req.user) {
			return res.redirect("/auth/google/failure");
		}

		const token = jwt.sign(
			{ id: req.user._id, email: req.user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		// Redirect to client with token (client should extract and store it)
		return res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
	} catch (err) {
		console.error("Google callback error:", err);
		return res.redirect("/auth/google/failure");
	}
};

export const googleAuthFailure = (req, res) => {
	// Give a friendly message for failures; client can handle `/auth/google/failure` route
	return res.status(401).json({ success: false, message: "Google authentication failed" });
};

export default {
	googleAuthCallback,
	googleAuthFailure,
};
