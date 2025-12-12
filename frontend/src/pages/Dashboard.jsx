import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, Package, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard, SkeletonDashboardStats, SkeletonDashboardTable } from '../component/SkeletonLoader';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

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

          // Calculate stats
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

          // Get recent products (last 5)
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

  // Generate mini chart data for each card
  const generateChartData = (value, trend = 'up') => {
    const points = 8;
    const data = [];
    for (let i = 0; i < points; i++) {
      const base = value * 0.7;
      const variance = value * 0.3;
      const trendFactor = trend === 'up' ? (i / points) * 0.5 : -(i / points) * 0.3;
      data.push({
        value: base + (Math.random() * variance) + (value * trendFactor)
      });
    }
    return data;
  };

  const StatCard = ({ icon: Icon, title, value, color, percentage, trend = 'up' }) => {
    const chartData = generateChartData(typeof value === 'number' ? value : parseFloat(value) || 50, trend);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={18} style={{ color }} />
              <p className="text-gray-600 text-sm font-medium">{title}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {percentage !== undefined && (
              <p className="text-xs text-gray-500 mt-1">{percentage}% of total</p>
            )}
          </div>
        </div>
        
        {/* Mini Curve Chart */}
        <div className="h-12 -mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time overview of your product performance</p>
        </div>
        {/* {selectedAccount && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Account</p>
            <p className="text-lg font-semibold text-gray-900">{selectedAccount.accountName}</p>
          </div>
        )} */}
      </div>

      {/* Stats Grid */}
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
              trend="up"
            />
            <StatCard
              icon={CheckCircle}
              title="Approved"
              value={stats.approvedProducts}
              color="#10B981"
              percentage={stats.approvalRate}
              trend="up"
            />
            <StatCard
              icon={XCircle}
              title="Disapproved"
              value={stats.disapprovedProducts}
              color="#EF4444"
              percentage={stats.totalProducts > 0 ? Math.round((stats.disapprovedProducts / stats.totalProducts) * 100) : 0}
              trend="down"
            />
            <StatCard
              icon={AlertCircle}
              title="Pending"
              value={stats.pendingProducts}
              color="#F59E0B"
              percentage={stats.totalProducts > 0 ? Math.round((stats.pendingProducts / stats.totalProducts) * 100) : 0}
              trend="up"
            />
            <StatCard
              icon={TrendingUp}
              title="Approval Rate"
              value={`${stats.approvalRate}%`}
              color="#8B5CF6"
              trend="up"
            />
          </>
        )}
      </div>

      {/* Status Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 size={20} />
            Product Status Distribution
          </h2>
          <div className="space-y-4">
            {/* Approved Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Approved</span>
                <span className="text-sm font-bold text-green-600">{stats.approvedProducts}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalProducts > 0 ? (stats.approvedProducts / stats.totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Disapproved Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Disapproved</span>
                <span className="text-sm font-bold text-red-600">{stats.disapprovedProducts}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalProducts > 0 ? (stats.disapprovedProducts / stats.totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Pending Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Pending</span>
                <span className="text-sm font-bold text-amber-600">{stats.pendingProducts}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalProducts > 0 ? (stats.pendingProducts / stats.totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <span className="text-gray-700 font-medium">Approved Products</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.approvedProducts.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-3">
                <XCircle className="text-red-600" size={24} />
                <span className="text-gray-700 font-medium">Disapproved Products</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats.disapprovedProducts.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-amber-600" size={24} />
                <span className="text-gray-700 font-medium">Pending Review</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">{stats.pendingProducts.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Brand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <SkeletonDashboardTable />
              ) : (
                recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">{product.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          product.approvalStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : product.approvalStatus === 'disapproved'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {product.approvalStatus === 'approved' && <CheckCircle size={14} />}
                        {product.approvalStatus === 'disapproved' && <XCircle size={14} />}
                        {product.approvalStatus === 'pending' && <AlertCircle size={14} />}
                        {product.approvalStatus.charAt(0).toUpperCase() + product.approvalStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.price ? `${product.price.currency} ${product.price.value}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.brand || 'N/A'}</td>
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