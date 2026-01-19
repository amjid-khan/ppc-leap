import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

const Form = () => {
  const { register, login, loginWithToken } = useAuth();
  const { isDarkMode } = useTheme();
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

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const urlToken = searchParams.get("token");

      if (urlToken && !processingGoogleToken) {
        setProcessingGoogleToken(true);
        try {
          const res = await loginWithToken(urlToken);
          window.history.replaceState({}, document.title, window.location.pathname);

          if (res.success) {
            setTimeout(() => {
              navigate("/admin", { replace: true });
              window.history.replaceState(null, "", "/admin");
            }, 500);
          } else {
            setError(res?.message || "Google login failed");
            setProcessingGoogleToken(false);
          }
        } catch {
          setError("Google login failed");
          setProcessingGoogleToken(false);
        }
      }
    };

    handleGoogleCallback();
  }, [location.search, loginWithToken, navigate, processingGoogleToken]);

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

    const res = isLoginForm
      ? await login(email, password)
      : await register(name, email, password);

    if (!res.success) {
      setError(res.message);
      setLoading(false);
    } else {
      resetForm();
      navigate(res.user?.role === "superadmin" ? "/superadmin/dashboard" : "/admin", {
        replace: true,
      });
    }
  };

  const handleToggle = () => {
    setIsLoginForm(!isLoginForm);
    resetForm();
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `${API}/api/auth/google`;
  };

  if (processingGoogleToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Signing you in...
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className={`w-full h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'} overflow-hidden flex flex-col md:flex-row`}>

        {/* Left Side - 70% IMAGE */}
<div className="md:w-[70%] h-screen">
  <img
    src="/form.png"
    alt="Form Visual"
   className="w-full h-full object-cover object-center"

  />
</div>


        {/* Right Side - 30% FORM */}
        <div className="md:w-[30%] p-8 md:p-12 flex items-center justify-center">
          <div className="w-full">

            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isLoginForm ? "Welcome Back" : "Create Account"}
              </h2>
            </div>

            {error && (
              <div className="bg-red-100 text-red-600 px-4 py-3 rounded mb-6 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLoginForm && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 border rounded-lg ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-500' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
                  required
                />
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 border rounded-lg ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-500' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 border rounded-lg ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-500' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                {loading ? "Processing..." : isLoginForm ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className={`w-full flex items-center justify-center gap-3 border rounded-lg py-3 ${isDarkMode ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-gray-900 hover:bg-gray-50'}`}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
                <span>Sign in with Google</span>
              </button>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleToggle}
                className={`font-medium hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
              >
                {isLoginForm ? "Create Account" : "Sign In"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
