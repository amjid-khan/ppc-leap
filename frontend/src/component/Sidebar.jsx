import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin"
    },
    {
      label: "Feed Data",
      icon: Database,
      path: "/admin/feeddata"
    },
    {
      label: "Users",
      icon: Users,
      path: "/admin/users"
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/admin/settings"
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowLogoutConfirm(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Extract first letter from name
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <>
      <aside className="w-64 bg-white h-screen flex flex-col border-r border-slate-200 shadow-sm">
        {/* User Info - Top */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 px-3 py-3 bg-white rounded-lg border border-slate-200 shadow-sm">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center text-lg font-bold shadow-md">
              {avatarLetter}
            </div>
            
            {/* User Details */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">
                {user?.name}
              </p>
              <p className="text-slate-500 text-xs truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 p-6">
          <nav className="flex flex-col space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === "/admin" 
                ? (location.pathname === "/admin" || location.pathname === "/admin/dashboard")
                : location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? "bg-blue-50 text-green-600 border border-blue-100" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                    }
                  `}
                >
                  <div className={`
                    absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-200
                    ${isActive 
                      ? "bg-green-600 opacity-100" 
                      : "bg-slate-300 opacity-0 group-hover:opacity-100"
                    }
                  `} />
                  
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive 
                        ? "text-green-600" 
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button - Sticky Bottom */}
        <div className="sticky bottom-0 p-4 bg-white border-t border-slate-200">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-200 font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 mx-4">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            {/* Message */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Confirm Logout
              </h3>
              <p className="text-slate-600 text-sm">
                Are you sure you want to logout from your account?
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition duration-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;