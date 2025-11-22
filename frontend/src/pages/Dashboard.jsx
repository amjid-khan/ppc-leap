import React from "react";
import { useAuth } from "../context/AuthContext";
import { Database, Users, TrendingUp, Package } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data - yahan aap real data integrate kar sakte hain
  const stats = [
    {
      title: "Total Products",
      value: "6,234",
      icon: Package,
      color: "bg-blue-500",
      change: "+12%"
    },
    {
      title: "Active Products",
      value: "5,891",
      icon: Database,
      color: "bg-green-500",
      change: "+8%"
    },
    {
      title: "Total Users",
      value: "1,234",
      icon: Users,
      color: "bg-purple-500",
      change: "+15%"
    },
    {
      title: "Growth Rate",
      value: "24.5%",
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "+5.2%"
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
          Here's what's happening with your feed optimizer today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
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
                <span className="text-green-600 text-sm font-medium">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity / Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
              <span className="font-medium text-blue-700">View All Products</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
              <span className="font-medium text-green-700">Optimize Feed</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
              <span className="font-medium text-purple-700">View Analytics</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Feed optimization completed
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  New products synced from Google
                </p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  System backup completed
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

