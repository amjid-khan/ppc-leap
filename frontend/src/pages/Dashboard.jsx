import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, Package, BarChart3, ShoppingBag, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard, SkeletonDashboardStats, SkeletonDashboardTable } from '../component/SkeletonLoader';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  const { getProducts, selectedAccount } = useAuth();
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
          const approved = products.filter(p => p.approvalStatus === 'approved').length;
          const disapproved = products.filter(p => p.approvalStatus === 'disapproved').length;
          const pending = products.filter(p => p.approvalStatus === 'pending').length;
          const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

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
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getProducts, selectedAccount]);

  const generateChartData = (value, trend = 'up') => {
    const points = 12;
    const data = [];
    for (let i = 0; i < points; i++) {
      const base = value * 0.6;
      const variance = value * 0.4;
      const trendFactor = trend === 'up' ? (i / points) * 0.6 : -(i / points) * 0.4;
      data.push({
        value: base + (Math.random() * variance) + (value * trendFactor)
      });
    }
    return data;
  };

  const StatCard = ({ icon: Icon, title, value, color, percentage, trend = 'up', iconBgLight, gradientId }) => {
    const chartData = generateChartData(typeof value === 'number' ? value : parseFloat(value) || 50, trend);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-shadow duration-300 hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`${iconBgLight} p-2.5 rounded-lg`}>
                <Icon size={20} style={{ color }} />
              </div>
              <p className="text-gray-600 text-sm font-medium">{title}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {percentage !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {trend === 'up' ? '↑' : '↓'} {percentage}%
                </span>
                <span className="text-xs text-gray-500">of total</span>
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
                  <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05}/>
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
  <div className="bg-white rounded-lg border border-gray-300 p-3">
    <div className="flex justify-between items-start">
      
      {/* Left Section */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-gray-100 p-2.5 rounded-lg">
            <Activity className="text-black" size={26} />
          </div>
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        </div>
        <p className="text-gray-600 mt-1 text-base">
          Real-time overview of your product performance
        </p>
      </div>

      {/* Right Section */}
      {selectedAccount && (
        <div className="text-right bg-gray-50 rounded-lg p-3 border border-gray-300">
          <p className="text-lg font-bold text-gray-900">
            {selectedAccount.accountName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ID: {selectedAccount.merchantId}
          </p>
        </div>
      )}
    </div>
  </div>
</div>


      {/* Stats Grid - Simple White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {loading ? (
          <SkeletonDashboardStats />
        ) : (
          <>
            <StatCard
              icon={Package}
              title="Total Products"
              value={stats.totalProducts}
              color="#3B82F6"
              iconBgLight="bg-blue-50"
              gradientId="grad-blue"
              trend="up"
            />
            <StatCard
              icon={CheckCircle}
              title="Approved"
              value={stats.approvedProducts}
              color="#10B981"
              iconBgLight="bg-green-50"
              gradientId="grad-green"
              percentage={stats.approvalRate}
              trend="up"
            />
            <StatCard
              icon={XCircle}
              title="Disapproved"
              value={stats.disapprovedProducts}
              color="#EF4444"
              iconBgLight="bg-red-50"
              gradientId="grad-red"
              percentage={stats.totalProducts > 0 ? Math.round((stats.disapprovedProducts / stats.totalProducts) * 100) : 0}
              trend="down"
            />
            <StatCard
              icon={AlertCircle}
              title="Pending"
              value={stats.pendingProducts}
              color="#F59E0B"
              iconBgLight="bg-amber-50"
              gradientId="grad-amber"
              percentage={stats.totalProducts > 0 ? Math.round((stats.pendingProducts / stats.totalProducts) * 100) : 0}
              trend="up"
            />
            <StatCard
              icon={TrendingUp}
              title="Approval Rate"
              value={`${stats.approvalRate}%`}
              color="#8B5CF6"
              iconBgLight="bg-purple-50"
              gradientId="grad-purple"
              trend="up"
            />
          </>
        )}
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-50 p-2.5 rounded-lg">
              <BarChart3 size={22} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Product Status Distribution</h2>
          </div>
          <div className="space-y-5">
            {/* Approved Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Approved</span>
                </div>
                <span className="text-base font-bold text-green-600">{stats.approvedProducts}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: `${stats.totalProducts > 0 ? (stats.approvedProducts / stats.totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Disapproved Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700">Disapproved</span>
                </div>
                <span className="text-base font-bold text-red-600">{stats.disapprovedProducts}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{ width: `${stats.totalProducts > 0 ? (stats.disapprovedProducts / stats.totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Pending Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-base font-bold text-amber-600">{stats.pendingProducts}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{ width: `${stats.totalProducts > 0 ? (stats.pendingProducts / stats.totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Light Colors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <ShoppingBag size={22} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2.5 rounded-lg">
                  <CheckCircle className="text-green-600" size={22} />
                </div>
                <span className="text-gray-700 font-medium">Approved Products</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.approvedProducts.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2.5 rounded-lg">
                  <XCircle className="text-red-600" size={22} />
                </div>
                <span className="text-gray-700 font-medium">Disapproved Products</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats.disapprovedProducts.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2.5 rounded-lg">
                  <AlertCircle className="text-amber-600" size={22} />
                </div>
                <span className="text-gray-700 font-medium">Pending Review</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">{stats.pendingProducts.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products Table - Light Colors */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Package size={22} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Brand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <SkeletonDashboardTable />
              ) : (
                recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">{product.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          product.approvalStatus === 'approved'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : product.approvalStatus === 'disapproved'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {product.approvalStatus === 'approved' && <CheckCircle size={13} />}
                        {product.approvalStatus === 'disapproved' && <XCircle size={13} />}
                        {product.approvalStatus === 'pending' && <AlertCircle size={13} />}
                        {product.approvalStatus.charAt(0).toUpperCase() + product.approvalStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {product.price ? `${product.price.currency} ${product.price.value}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.brand || 'N/A'}</td>
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