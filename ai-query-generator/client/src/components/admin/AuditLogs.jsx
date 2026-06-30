import { useState, useEffect } from 'react';
import { FiFileText, FiShield, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import { queryService } from '../../services/queryService';
import Loader from '../common/Loader';

const STATUS_STYLES = {
  success: 'text-green-400 bg-green-400/10',
  failed: 'text-red-400 bg-red-400/10',
  blocked: 'text-orange-400 bg-orange-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
};

const ACTION_ICONS = {
  LOGIN: <FiShield size={12} className="text-blue-400" />,
  REGISTER: <FiShield size={12} className="text-green-400" />,
  QUERY_GENERATED: <FiCheck size={12} className="text-purple-400" />,
  QUERY_BLOCKED: <FiX size={12} className="text-red-400" />,
  QUERY_APPROVED: <FiCheck size={12} className="text-green-400" />,
  QUERY_REJECTED: <FiX size={12} className="text-red-400" />,
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchLogs(); }, [page, statusFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await queryService.getAuditLogs({ page, limit: 20, status: statusFilter || undefined });
      setLogs(data.data.logs);
      setPages(data.data.pages);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FiFileText className="text-purple-400" />
          <h3 className="text-lg font-bold text-white">Audit Logs</h3>
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-auto text-sm py-2">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="blocked">Blocked</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">IP Address</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {ACTION_ICONS[log.action] || <FiAlertTriangle size={12} className="text-gray-400" />}
                      <span className="text-gray-300 font-mono text-xs">{log.action}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div>
                      <p className="text-gray-300">{log.user?.name || 'System'}</p>
                      <p className="text-gray-600 text-xs">{log.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[log.status] || ''}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs font-mono">{log.ipAddress || '-'}</td>
                  <td className="py-3 text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary text-xs px-4 py-2 disabled:opacity-40">Prev</button>
          <span className="flex items-center text-sm text-gray-500">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="btn-secondary text-xs px-4 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
