import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiUsers, FiFileText, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { queryService } from '../services/queryService';
import PendingApprovals from '../components/admin/PendingApprovals';
import AuditLogs from '../components/admin/AuditLogs';
import Loader from '../components/common/Loader';

const TABS = ['overview', 'pending', 'users', 'audit'];

const Admin = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    queryService.getAdminStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'users') {
      queryService.getAllUsers().then(({ data }) => setUsers(data.data.users)).catch(() => {});
    }
  }, [tab]);

  const handleRoleChange = async (userId, role) => {
    try {
      await queryService.updateUserRole(userId, role);
      setUsers(u => u.map(i => i._id === userId ? { ...i, role } : i));
    } catch {}
  };

  const handleToggleStatus = async (userId) => {
    try {
      await queryService.toggleUserStatus(userId);
      setUsers(u => u.map(i => i._id === userId ? { ...i, isActive: !i.isActive } : i));
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <FiShield className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm">System management and oversight</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm capitalize transition-all border-b-2 ${
              tab === t ? 'text-white border-purple-500' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        loading ? <div className="flex justify-center py-12"><Loader /></div> : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <FiUsers />, label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-blue-500/10 text-blue-400' },
                { icon: <FiActivity />, label: 'Total Queries', value: stats?.totalQueries || 0, color: 'bg-purple-500/10 text-purple-400' },
                { icon: <FiAlertTriangle />, label: 'Pending Reviews', value: stats?.pendingCount || 0, color: 'bg-amber-500/10 text-amber-400' },
                { icon: <FiShield />, label: 'Blocked Attempts', value: stats?.blockedCount || 0, color: 'bg-red-500/10 text-red-400' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }} className="card">
                  <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${s.color}`}>{s.icon}</div>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="card">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <FiFileText className="text-purple-400" /> Recent Activity
              </h3>
              <div className="space-y-2">
                {stats?.recentLogs?.map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-400' : log.status === 'blocked' ? 'bg-red-400' : 'bg-amber-400'}`} />
                      <span className="text-sm text-gray-300 font-mono">{log.action}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{log.user?.name || 'System'}</span>
                      <span className="text-xs text-gray-600">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {tab === 'pending' && <PendingApprovals />}

      {tab === 'users' && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
                  <th className="text-left pb-3 pr-4">User</th>
                  <th className="text-left pb-3 pr-4">Role</th>
                  <th className="text-left pb-3 pr-4">Status</th>
                  <th className="text-left pb-3 pr-4">Queries</th>
                  <th className="text-left pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="text-gray-200">{u.name}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="input-field text-xs py-1 w-32">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{u.totalQueries || 0}</td>
                    <td className="py-3">
                      <button onClick={() => handleToggleStatus(u._id)}
                        className="text-xs px-3 py-1.5 glass rounded-lg text-gray-400 hover:text-white border border-white/10 hover:border-purple-500/40 transition-all">
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'audit' && <AuditLogs />}
    </div>
  );
};

export default Admin;
