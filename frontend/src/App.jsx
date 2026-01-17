import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Form from "./pages/Form.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
import SuperAdminAccount from "./pages/SuperAdminAccount.jsx";
import FeedData from "./component/FeedData.jsx";
import AdminLayout from "./component/AdminLayout.jsx";
import SuperAdminLayout from "./component/SuperAdminLayout.jsx";
import ProtectedRoute from "./component/ProtectedRoute.jsx";
import SuperAdminRoute from "./component/SuperAdminRoute.jsx";
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
          // Remove token from URL - will redirect based on role in next effect
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error("Token login failed:", res.message);
        }
      });
    }
  }, [loginWithToken]);

  // Separate effect for role-based redirect after login
  useEffect(() => {
    if (!loading && user) {
      // If superadmin is on any admin route, redirect to superadmin dashboard
      if (user.role === "superadmin" && location.pathname.startsWith("/admin")) {
        navigate("/superadmin/dashboard", { replace: true });
        // Replace history to prevent back navigation
        window.history.replaceState(null, "", "/superadmin/dashboard");
        return;
      }
      
      // If regular admin/user tries to access superadmin route, redirect to admin dashboard
      if (user.role !== "superadmin" && location.pathname.startsWith("/superadmin")) {
        navigate("/admin", { replace: true });
        return;
      }
      
      // If on login page, redirect based on role
      if (location.pathname === "/") {
        if (user.role === "superadmin") {
          navigate("/superadmin/dashboard", { replace: true });
          // Replace history to prevent back navigation to login
          setTimeout(() => {
            window.history.replaceState(null, "", "/superadmin/dashboard");
            window.history.pushState(null, "", "/superadmin/dashboard");
          }, 100);
        } else {
          navigate("/admin", { replace: true });
          window.history.replaceState(null, "", "/admin");
        }
      }
    }
  }, [user, loading, location.pathname, navigate]);

  return null;
};

// Public route wrapper for login page
const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useAuth();

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
    // Redirect based on user role
    if (user?.role === "superadmin") {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Handles invalid or unknown routes
const InvalidRouteHandler = () => {
  const { loading, isAuthenticated, user } = useAuth();

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
    // Redirect based on user role
    if (user?.role === "superadmin") {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/" replace />;
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

        {/* Super Admin routes */}
        <Route 
          path="/superadmin" 
          element={
            <SuperAdminRoute>
              <SuperAdminLayout />
            </SuperAdminRoute>
          }
        >
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="account" element={<SuperAdminAccount />} />
          <Route index element={<Navigate to="dashboard" replace />} />
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
