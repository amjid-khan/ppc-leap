import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Package,
  BarChart3,
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
  PieChart,
  Pie,
  Cell,
  Tooltip,
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
      // Show loading immediately when switching accounts
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
        // Use one-decimal precision so mixed approval/disapproval isn’t shown as 100%
        const approvalRate =
          total > 0 ? Math.round((approved / total) * 1000) / 10 : 0;

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
        // Hide loading when data is ready
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getProducts, selectedAccount]);

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

  const statusChartData = [
    { name: "Approved", value: stats.approvedProducts, color: "#22c55e" },
    { name: "Disapproved", value: stats.disapprovedProducts, color: "#ef4444" },
    { name: "Pending", value: stats.pendingProducts, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  return (
    <div className="">
      {/* Premium Header */}
      <div className="mb-6 relative">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-3">
          <div className="flex justify-between items-start">
            {/* Left Section */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-green-500 dark:bg-green-800 p-2.5 rounded-lg">
                  <Activity className="text-white dark:text-white" size={26} />
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



      {/* Product Status – Full‑width modern graph card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/40 p-2.5 rounded-xl">
              <BarChart3 size={22} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Product Status Overview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Approved, disapproved &amp; pending at a glance
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
          {/* Donut chart */}
          <div className="relative w-full lg:max-w-[280px] h-[220px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(v) => v.toLocaleString()}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--tw-gray-200, #e5e7eb)",
                    background: "var(--tw-bg-white, #fff)",
                  }}
                />
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="transparent"
                >
                  {statusChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalProducts.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Total
              </span>
            </div>
          </div>

          {/* Stats blocks + stacked bar */}
          <div className="flex-1 w-full min-w-0 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50/80 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-500/15 dark:bg-green-500/25 flex items-center justify-center">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400 tabular-nums">
                    {stats.approvedProducts.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.totalProducts > 0
                      ? `${Math.round((stats.approvedProducts / stats.totalProducts) * 1000) / 10}% of total`
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-red-500/15 dark:bg-red-500/25 flex items-center justify-center">
                  <XCircle className="text-red-600 dark:text-red-400" size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disapproved</p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-400 tabular-nums">
                    {stats.disapprovedProducts.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.totalProducts > 0
                      ? `${Math.round((stats.disapprovedProducts / stats.totalProducts) * 1000) / 10}% of total`
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-500/15 dark:bg-amber-500/25 flex items-center justify-center">
                  <AlertCircle className="text-amber-600 dark:text-amber-400" size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                    {stats.pendingProducts.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.totalProducts > 0
                      ? `${Math.round((stats.pendingProducts / stats.totalProducts) * 1000) / 10}% of total`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stacked bar – mini graph */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Distribution</p>
              <div className="h-3 w-full rounded-full flex overflow-hidden bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalProducts > 0
                        ? (stats.approvedProducts / stats.totalProducts) * 100
                        : 0
                    }%`,
                  }}
                />
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalProducts > 0
                        ? (stats.disapprovedProducts / stats.totalProducts) * 100
                        : 0
                    }%`,
                  }}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalProducts > 0
                        ? (stats.pendingProducts / stats.totalProducts) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
