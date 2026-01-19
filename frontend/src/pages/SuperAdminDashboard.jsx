import React, { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Mail, Calendar, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    superAdminUsers: 0,
  });

  // Prevent back navigation to login page - STRONG PROTECTION
  useEffect(() => {
    // Immediately replace and push state to prevent back navigation
    const dashboardPath = "/superadmin/dashboard";
    window.history.replaceState(null, "", dashboardPath);
    window.history.pushState(null, "", dashboardPath);
    
    const handlePopState = (event) => {
      // Prevent default back navigation
      event.preventDefault();
      event.stopPropagation();
      
      // Immediately redirect back to dashboard
      navigate("/superadmin/dashboard", { replace: true });
      window.history.pushState(null, "", "/superadmin/dashboard");
    };

    const handleHashChange = () => {
      navigate("/superadmin/dashboard", { replace: true });
      window.history.pushState(null, "", "/superadmin/dashboard");
    };

    // Add event listeners
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    
    // Monitor URL changes
    const checkUrl = setInterval(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== "/superadmin/dashboard" && currentPath !== "/superadmin") {
        navigate("/superadmin/dashboard", { replace: true });
        window.history.pushState(null, "", "/superadmin/dashboard");
      }
    }, 300);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
      clearInterval(checkUrl);
    };
  }, [navigate]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const usersList = res.data || [];
      setUsers(usersList);

      // Calculate stats
      const total = usersList.length;
      const admins = usersList.filter((u) => u.role === "admin").length;
      const regular = usersList.filter((u) => u.role === "user").length;
      const superAdmins = usersList.filter((u) => u.role === "superadmin").length;

      setStats({
        totalUsers: total,
        adminUsers: admins,
        regularUsers: regular,
        superAdminUsers: superAdmins,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "admin":
        return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "user":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="">
      {/* Premium Header */}
      <div className="mb-6 relative">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-3">
          <div className="flex justify-between items-start">
            {/* Left Section */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg">
                  <Users className="text-black dark:text-white" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  Super Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                Manage all users and system overview
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Simple White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Super Admins
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.superAdminUsers}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <UserCheck className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Admins
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.adminUsers}
                </p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg">
                <UserCheck className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Regular Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.regularUsers}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <UserX className="text-gray-600 dark:text-gray-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              All Users
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Accounts
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((userItem) => (
                      <tr
                        key={userItem._id || userItem.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {userItem.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            {userItem.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                              userItem.role || "user"
                            )}`}
                          >
                            {(userItem.role || "user").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(userItem.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {userItem.googleMerchantAccounts?.length || 0} account(s)
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
};

export default SuperAdminDashboard;
