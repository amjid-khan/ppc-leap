import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Database, Package, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const { user, selectedAccount } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    disapprovedProducts: 0,
    approvalRate: "0.0%"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedAccount) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API}/api/merchant/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedAccount]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const statsCards = [
    {
      title: "Total Products",
      value: formatNumber(stats.totalProducts),
      icon: Package,
      color: "bg-blue-500",
      change: null
    },
    {
      title: "Approved Products",
      value: formatNumber(stats.approvedProducts),
      icon: CheckCircle,
      color: "bg-green-500",
      change: null
    },
    {
      title: "Pending Products",
      value: formatNumber(stats.pendingProducts),
      icon: AlertCircle,
      color: "bg-yellow-500",
      change: null
    },
    {
      title: "Approval Rate",
      value: stats.approvalRate,
      icon: TrendingUp,
      color: "bg-purple-500",
      change: null
    }
  ];

  return (
    <div className="p-6 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-gray-600">
          {selectedAccount 
            ? `Here's what's happening with ${selectedAccount.accountName || 'your account'} today.`
            : "Please select an account to view statistics."}
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : !selectedAccount ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600">Please select an account to view statistics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`${stat.color} p-3 rounded-lg text-white`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {stat.change && (
                    <span className="text-green-600 text-sm font-medium">
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Info & Quick Actions */}
      {selectedAccount && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="text-lg font-medium text-gray-800">{selectedAccount.accountName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Merchant ID</p>
                <p className="text-lg font-mono text-gray-800">{selectedAccount.merchantId || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Product Status Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Product Status Summary
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-800">Approved</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{formatNumber(stats.approvedProducts)}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-800">Pending</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{formatNumber(stats.pendingProducts)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-800">Disapproved</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{formatNumber(stats.disapprovedProducts)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

