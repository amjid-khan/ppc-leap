import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Form from "./pages/Form.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FeedData from "./component/FeedData.jsx";
import AdminLayout from "./component/AdminLayout.jsx";
import ProtectedRoute from "./component/ProtectedRoute.jsx";
import Keywords from "./component/Keywords.jsx";
import { useAuth } from "./context/AuthContext.jsx";

// Handles Google OAuth redirect token and automatic login
const AuthRedirectHandler = () => {
  const { user, loading, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // Log in user with token from Google OAuth
      loginWithToken(token).then(res => {
        if (res.success) {
          // Remove token from URL
          window.history.replaceState({}, document.title, "/admin");
        } else {
          console.error("Token login failed:", res.message);
        }
      });
    } else if (!loading && user && location.pathname === "/") {
      // Redirect logged-in user away from login page
      navigate("/admin", { replace: true });
    }
  }, [user, loading, location.pathname, navigate, loginWithToken]);

  return null;
};

// Public route wrapper for login page
const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Handles invalid or unknown routes
const InvalidRouteHandler = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated() 
    ? <Navigate to="/admin" replace />
    : <Navigate to="/" replace />;
};

// Router wrapper component
const AppRoutes = () => {
  return (
    <Router>
      <AuthRedirectHandler />
      <Routes>
        {/* Login / Public route */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Form />
            </PublicRoute>
          } 
        />

        {/* Protected Admin routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="feeddata" element={<FeedData />} />
          <Route path="keywords" element={<Keywords />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />

        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<InvalidRouteHandler />} />
      </Routes>
    </Router>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;
