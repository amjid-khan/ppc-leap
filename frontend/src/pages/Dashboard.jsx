import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Package,
  BarChart3,
  ShoppingBag,
  Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  SkeletonCard,
  SkeletonDashboardStats,
  SkeletonDashboardTable,
} from "../component/SkeletonLoader";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const Dashboard = () => {
  const { getProducts, selectedAccount, isAccountSwitching } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    approvedProducts: 0,
    disapprovedProducts: 0,
    pendingProducts: 0,
    approvalRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const result = await getProducts(1, 10000);
        if (result.success && result.products) {
          const products = result.products;

          const total = products.length;
          const approved = products.filter(
            (p) => p.approvalStatus === "approved"
          ).length;
          const disapproved = products.filter(
            (p) => p.approvalStatus === "disapproved"
          ).length;
          const pending = products.filter(
            (p) => p.approvalStatus === "pending"
          ).length;
          const approvalRate =
            total > 0 ? Math.round((approved / total) * 100) : 0;

          setStats({
            totalProducts: total,
            approvedProducts: approved,
            disapprovedProducts: disapproved,
            pendingProducts: pending,
            approvalRate: approvalRate,
          });

          setRecentProducts(products.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getProducts, selectedAccount, isAccountSwitching]);

  const generateChartData = (value, trend = "up") => {
    const points = 12;
    const data = [];
    for (let i = 0; i < points; i++) {
      const base = value * 0.6;
      const variance = value * 0.4;
      const trendFactor =
        trend === "up" ? (i / points) * 0.6 : -(i / points) * 0.4;
      data.push({
        value: base + Math.random() * variance + value * trendFactor,
      });
    }
    return data;
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    color,
    percentage,
    trend = "up",
    iconBgLight,
    gradientId,
  }) => {
    const chartData = generateChartData(
      typeof value === "number" ? value : parseFloat(value) || 50,
      trend
    );

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-shadow duration-300 hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`${iconBgLight} dark:bg-opacity-20 p-2.5 rounded-lg`}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {title}
              </p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {percentage !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    trend === "up"
                      ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-400"
                  }`}
                >
                  {trend === "up" ? "↑" : "↓"} {percentage}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  of total
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subtle Area Chart */}
        <div className="h-14 -mb-2 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
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
                  <Activity className="text-black dark:text-white" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  Dashboard
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                Real-time overview of your product performance
              </p>
            </div>

            {/* Right Section */}
            
          </div>
        </div>
      </div>

      {/* Stats Grid - Simple White Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
  {loading ? (
    <SkeletonDashboardStats />
  ) : (
    <>
      {[
        {
          title: "Total Products",
          value: stats.totalProducts,
          icon: Package,
          color: "text-blue-600",
          bgGradient: "from-blue-100 to-blue-200",
        },
        {
          title: "Approved",
          value: stats.approvedProducts,
          icon: CheckCircle,
          color: "text-green-600",
          bgGradient: "from-green-100 to-green-200",
          percentage: stats.approvalRate,
        },
        {
          title: "Disapproved",
          value: stats.disapprovedProducts,
          icon: XCircle,
          color: "text-red-600",
          bgGradient: "from-red-100 to-red-200",
          percentage:
            stats.totalProducts > 0
              ? Math.round((stats.disapprovedProducts / stats.totalProducts) * 100)
              : 0,
        },
        {
          title: "Pending",
          value: stats.pendingProducts,
          icon: AlertCircle,
          color: "text-amber-600",
          bgGradient: "from-amber-100 to-amber-200",
          percentage:
            stats.totalProducts > 0
              ? Math.round((stats.pendingProducts / stats.totalProducts) * 100)
              : 0,
        },
        {
          title: "Approval Rate",
          value: `${stats.approvalRate}%`,
          icon: TrendingUp,
          color: "text-purple-600",
          bgGradient: "from-purple-100 to-purple-200",
        },
      ].map((item) => (
        <div
          key={item.title}
          className={`flex flex-col p-5 bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-300 dark:border-gray-700`}
        >
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br ${item.bgGradient} mb-4`}
          >
            <item.icon className={`${item.color} w-6 h-6`} />
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{item.title}</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</span>
            {item.percentage !== undefined && (
              <span
                className={`text-sm font-semibold ${
                  item.percentage > 50 ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.percentage}%
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  )}
</div>



      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-900 p-2.5 rounded-lg">
              <BarChart3
                size={22}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Product Status Distribution
            </h2>
          </div>
          <div className="space-y-5">
            {/* Approved Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Approved
                  </span>
                </div>
                <span className="text-base font-bold text-green-600 dark:text-green-400">
                  {stats.approvedProducts}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{
                    width: `${
                      stats.totalProducts > 0
                        ? (stats.approvedProducts / stats.totalProducts) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Disapproved Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Disapproved
                  </span>
                </div>
                <span className="text-base font-bold text-red-500 dark:text-red-400">
                  {stats.disapprovedProducts}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{
                    width: `${
                      stats.totalProducts > 0
                        ? (stats.disapprovedProducts / stats.totalProducts) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Pending Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pending
                  </span>
                </div>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {stats.pendingProducts}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{
                    width: `${
                      stats.totalProducts > 0
                        ? (stats.pendingProducts / stats.totalProducts) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Light Colors */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900 p-2.5 rounded-lg">
              <ShoppingBag
                size={22}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Stats
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900 rounded-xl border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-800 p-2.5 rounded-lg">
                  <CheckCircle
                    className="text-green-600 dark:text-green-400"
                    size={22}
                  />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Approved Products
                </span>
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.approvedProducts.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900 rounded-xl border border-red-100 dark:border-red-800">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-800 p-2.5 rounded-lg">
                  <XCircle
                    className="text-red-600 dark:text-red-400"
                    size={22}
                  />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Disapproved Products
                </span>
              </div>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.disapprovedProducts.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900 rounded-xl border border-amber-100 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-800 p-2.5 rounded-lg">
                  <AlertCircle
                    className="text-amber-600 dark:text-amber-400"
                    size={22}
                  />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Pending Review
                </span>
              </div>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.pendingProducts.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products Table - Light Colors */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2.5 rounded-lg">
              <Package size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Products
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Brand
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <SkeletonDashboardTable />
              ) : (
                recentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                      {product.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          product.approvalStatus === "approved"
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                            : product.approvalStatus === "disapproved"
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                            : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {product.approvalStatus === "approved" && (
                          <CheckCircle size={13} />
                        )}
                        {product.approvalStatus === "disapproved" && (
                          <XCircle size={13} />
                        )}
                        {product.approvalStatus === "pending" && (
                          <AlertCircle size={13} />
                        )}
                        {product.approvalStatus.charAt(0).toUpperCase() +
                          product.approvalStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {product.price
                        ? `${product.price.currency} ${product.price.value}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {product.brand || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
