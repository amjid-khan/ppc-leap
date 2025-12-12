import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

const Form = () => {
  const { register, login, loginWithToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginForm, setIsLoginForm] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [processingGoogleToken, setProcessingGoogleToken] = useState(false);

  // Handle Google OAuth callback token
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const urlToken = searchParams.get("token");

      if (urlToken && !processingGoogleToken) {
        setProcessingGoogleToken(true);
        try {
          const res = await loginWithToken(urlToken);

          // Remove token from URL
          window.history.replaceState({}, document.title, window.location.pathname);

          if (res.success) {
            // Wait a moment for AuthContext to update, then redirect
            setTimeout(() => {
              navigate("/admin", { replace: true });
            }, 500);
          } else {
            setError(res?.message || "Google login failed");
            setProcessingGoogleToken(false);
          }
        } catch (err) {
          setError("Google login failed");
          setProcessingGoogleToken(false);
        }
      }
    };

    handleGoogleCallback();
  }, [location.search, loginWithToken, navigate, processingGoogleToken]);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    let res;
    if (isLoginForm) {
      res = await login(email, password);
    } else {
      res = await register(name, email, password);
    }

    if (!res.success) {
      setError(res.message);
      setLoading(false);
    } else {
      resetForm();
      // Redirect to dashboard
      navigate("/admin", { replace: true });
    }
  };

  const handleToggle = () => {
    setIsLoginForm(!isLoginForm);
    resetForm();
  };

  // Google Login handler
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Redirect to backend Google OAuth route
    window.location.href = `${API}/api/auth/google`;
  };

  if (processingGoogleToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 dark:from-gray-950 to-indigo-100 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 dark:from-gray-950 to-indigo-100 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side - Text */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {isLoginForm ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="text-blue-100 text-lg mb-6 leading-relaxed">
              {isLoginForm
                ? "Sign in to manage your Google Merchant Center feeds, accounts, and performance."
                : "Register to link your Google Merchant Center accounts and monitor real-time performance from a single dashboard."}
            </p>
            <div className="mt-8 flex items-center space-x-4">
              <div className="w-3 h-3 bg-white dark:bg-gray-700 rounded-full"></div>
              <div className="w-3 h-3 bg-white/50 dark:bg-gray-600/50 rounded-full"></div>
              <div className="w-3 h-3 bg-white/30 dark:bg-gray-600/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {isLoginForm ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isLoginForm ? "Sign in to your account" : "Register to get started"}
              </p>
            </div>

            {error && (
              <div className={`${
                !isLoginForm ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              } border px-4 py-3 rounded-lg mb-6 text-center`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLoginForm && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required={!isLoginForm}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200 font-medium ${
                  loading
                    ? "bg-blue-300 dark:bg-blue-700 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-700"
                }`}
              >
                {loading ? "Processing..." : isLoginForm ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Google Login */}
            <div className="mt-6">
              <div className="flex items-center mb-6">
                <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></span>
                <span className="px-4 text-sm text-gray-400 dark:text-gray-500 uppercase">or continue with</span>
                <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className={`w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 text-gray-700 dark:text-gray-300 font-medium transition duration-200 ${
                  googleLoading ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {googleLoading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="h-5 w-5"
                    />
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {isLoginForm ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={handleToggle}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition duration-200 hover:underline"
                >
                  {isLoginForm ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
