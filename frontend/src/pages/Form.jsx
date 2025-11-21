import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Form = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setFormDisabled(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin) {
      setFormDisabled(true);
      setError("Registration is disabled for this demo project. Please use login instead.");
      return;
    }

    setError("");
    setLoading(true);

    let res;
    if (isLogin) {
      res = await login(email, password);
    } else {
      res = await register(name, email, password);
    }

    if (!res.success) {
      setError(res.message);
    } else {
      resetForm();
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleToggle = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    
    if (!newIsLogin) {
      // If switching to register, disable the form
      setFormDisabled(true);
      setError("Registration is disabled for this demo project. Please use login instead.");
    } else {
      // If switching to login, enable the form
      setFormDisabled(false);
      setError("");
    }
    
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Text Content */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {isLogin ? "Welcome to Our Platform" : "Project Demo Notice"}
            </h1>
            
            {isLogin ? (
              <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                Welcome back! Sign in to continue your journey and access your personalized dashboard.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3 text-white">🚫 Registration Disabled</h3>
                  <p className="text-red-100 text-lg leading-relaxed">
                    This is a personal project demonstration. User registration has been disabled 
                    as this is not a production system.
                  </p>
                </div>
                
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <p className="text-blue-100 text-sm">
                    <span className="font-semibold">Note:</span> You are not authorized to register 
                    in this demo environment. Please use the login functionality with existing demo 
                    credentials, or switch back to login mode.
                  </p>
                </div>
                
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                  <p className="text-yellow-100 text-sm">
                    <span className="font-semibold">For Testing:</span> If you need to test the registration 
                    flow, please contact the project administrator for access to the development environment.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex items-center space-x-4">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
              <div className="w-3 h-3 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {isLogin ? "Welcome Back" : "Registration Disabled"}
              </h2>
              <p className="text-gray-600 mt-2">
                {isLogin ? "Sign in to your account" : "Demo mode - Registration unavailable"}
              </p>
            </div>

            {error && (
              <div className={`${
                !isLogin ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-50 border-red-200 text-red-600'
              } border px-4 py-3 rounded-lg mb-6 text-center`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="opacity-60">
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    required={!isLogin}
                    disabled={formDisabled}
                  />
                </div>
              )}

              <div className={!isLogin ? "opacity-60" : ""}>
                <label className={`block text-sm font-medium ${
                  !isLogin ? 'text-gray-500' : 'text-gray-700'
                } mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                    !isLogin ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  } transition duration-200`}
                  required
                  disabled={formDisabled}
                />
              </div>

              <div className={!isLogin ? "opacity-60" : ""}>
                <label className={`block text-sm font-medium ${
                  !isLogin ? 'text-gray-500' : 'text-gray-700'
                } mb-2`}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                    !isLogin ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  } transition duration-200`}
                  required
                  disabled={formDisabled}
                />
              </div>

              <button
                type="submit"
                disabled={loading || formDisabled}
                className={`w-full py-3 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium ${
                  !isLogin 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Registration Disabled"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={handleToggle}
                  className="text-blue-600 hover:text-blue-700 font-medium transition duration-200 hover:underline"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>

            {!isLogin && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <p className="text-orange-700 text-sm">
                  💡 <strong>Demo Tip:</strong> Switch back to Login to access the demo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;