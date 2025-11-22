import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, Users, Settings } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

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

  return (
    <aside className="w-56 bg-white h-screen p-6 border-r border-slate-200 shadow-sm">

      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // For Dashboard, check both /admin and /admin/dashboard
          const isActive = item.path === "/admin" 
            ? (location.pathname === "/admin" || location.pathname === "/admin/dashboard")
            : location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? "bg-gray-200 text-gray-900" 
                  : "text-slate-600 hover:bg-gray-200 hover:text-gray-900"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? "text-gray-700" : "text-slate-400 group-hover:text-gray-700"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
