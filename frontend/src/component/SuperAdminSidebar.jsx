import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users } from "lucide-react";

const SuperAdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      path: "/superadmin/dashboard"
    },
    {
      label: "Account",
      icon: Users,
      path: "/superadmin/account"
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 h-screen flex flex-col border-r border-gray-200 dark:border-gray-800">
      {/* Main Navigation */}
      <div className="flex-1 pt-6 px-3">
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
