import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiHeart, FiDatabase, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { queryService } from '../services/queryService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const StatCard = ({ icon, label, value, sub, color }) => (
  <motion.div whileHover={{ y: -2 }} className="card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queryService.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64"><Loader text="Loading dashboard..." /></div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your query generation overview</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FiZap size={20} className="text-purple-400" />} label="Total Queries"
          value={stats?.totalQueries || 0} sub="All time" color="bg-purple-500/10" />
        <StatCard icon={<FiHeart size={20} className="text-red-400" />} label="Favorites"
          value={stats?.totalFavorites || 0} sub="Saved queries" color="bg-red-500/10" />
        <StatCard icon={<FiActivity size={20} className="text-blue-400" />} label="AI Requests"
          value={stats?.aiRequests || 0} sub="Gemini calls" color="bg-blue-500/10" />
        <StatCard icon={<FiDatabase size={20} className="text-green-400" />} label="Top Database"
          value={stats?.mostUsedDb || 'N/A'} sub="Most used" color="bg-green-500/10" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Trend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-purple-400" />
            <h3 className="font-semibold text-white">Query Trend (7 Days)</h3>
          </div>
          {stats?.trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px' }}
                  labelStyle={{ color: '#e2e8f0' }} itemStyle={{ color: '#a78bfa' }} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6, fill: '#a78bfa' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No data yet — generate some queries!</div>
          )}
        </motion.div>

        {/* Database Usage */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiDatabase className="text-blue-400" />
            <h3 className="font-semibold text-white">Database Usage</h3>
          </div>
          {stats?.dbUsage?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.dbUsage} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={75} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false} fontSize={11}>
                  {stats.dbUsage.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No database usage data yet</div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
