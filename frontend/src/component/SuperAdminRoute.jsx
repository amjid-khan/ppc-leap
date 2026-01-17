import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const SuperAdminRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Prevent back navigation to login page - STRONG PROTECTION
  useEffect(() => {
    if (!loading && isAuthenticated() && user?.role === "superadmin") {
      // Immediately replace and push state to prevent back navigation
      const currentPath = "/superadmin/dashboard";
      window.history.replaceState(null, "", currentPath);
      window.history.pushState(null, "", currentPath);
      
      // Listen for browser back/forward button
      const handlePopState = (event) => {
        // Prevent default back navigation
        event.preventDefault();
        event.stopPropagation();
        
        // Immediately redirect back to dashboard
        navigate("/superadmin/dashboard", { replace: true });
        window.history.pushState(null, "", "/superadmin/dashboard");
      };

      // Add multiple layers of protection
      window.addEventListener("popstate", handlePopState);
      
      // Also prevent hashchange (some browsers use this)
      const handleHashChange = () => {
        navigate("/superadmin/dashboard", { replace: true });
        window.history.pushState(null, "", "/superadmin/dashboard");
      };
      
      window.addEventListener("hashchange", handleHashChange);

      // Periodically check and fix history
      const historyCheck = setInterval(() => {
        if (window.location.pathname !== "/superadmin/dashboard" && 
            window.location.pathname !== "/superadmin") {
          navigate("/superadmin/dashboard", { replace: true });
          window.history.pushState(null, "", "/superadmin/dashboard");
        }
      }, 500);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("hashchange", handleHashChange);
        clearInterval(historyCheck);
      };
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has superadmin role
  // Regular admin/users cannot access superadmin routes - redirect to admin dashboard
  if (user?.role !== "superadmin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
