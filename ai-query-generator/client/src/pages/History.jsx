import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiSearch, FiTrash2, FiEye, FiHeart, FiDatabase } from 'react-icons/fi';
import { queryService } from '../services/queryService';
import Loader from '../components/common/Loader';

const RISK_STYLES = { SAFE: 'risk-safe', WARNING: 'risk-warning', CRITICAL: 'risk-critical' };

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dbFilter, setDbFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchHistory(); }, [page, dbFilter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await queryService.getHistory({ page, limit: 10, databaseType: dbFilter || undefined, search: search || undefined });
      setHistory(data.data.history);
      setPages(data.data.pages);
      setTotal(data.data.total);
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this query?')) return;
    try {
      await queryService.deleteHistory(id);
      setHistory(h => h.filter(i => i._id !== id));
    } catch {}
  };

  const handleFavorite = async (item) => {
    try {
      if (item.isFavorite) {
        await queryService.removeFavorite(item._id);
      } else {
        await queryService.addFavorite(item._id, {});
      }
      setHistory(h => h.map(i => i._id === item._id ? { ...i, isFavorite: !i.isFavorite } : i));
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Query History</h1>
        <p className="text-gray-500 text-sm mt-1">{total} queries generated</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
            placeholder="Search queries..." className="input-field pl-9 py-2.5 text-sm" />
        </div>
        <select value={dbFilter} onChange={(e) => { setDbFilter(e.target.value); setPage(1); }}
          className="input-field w-auto text-sm py-2.5">
          <option value="">All Databases</option>
          {['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle SQL', 'SQL Server'].map(db => (
            <option key={db} value={db}>{db}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader /></div>
      ) : history.length === 0 ? (
        <div className="card text-center py-16">
          <FiClock className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-500">No history yet. Start generating queries!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }} className="card hover:border-purple-500/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <FiDatabase size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{item.databaseType}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_STYLES[item.riskLevel] || 'risk-safe'}`}>
                      {item.riskLevel}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 truncate">{item.prompt}</p>
                  <pre className="text-xs text-green-300/70 truncate font-mono bg-black/20 px-3 py-2 rounded-lg">
                    {item.generatedQuery?.substring(0, 120)}...
                  </pre>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(selected?._id === item._id ? null : item)}
                    className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors">
                    <FiEye size={14} />
                  </button>
                  <button onClick={() => handleFavorite(item)}
                    className={`w-8 h-8 glass rounded-lg flex items-center justify-center transition-colors ${item.isFavorite ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}>
                    <FiHeart size={14} fill={item.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => handleDelete(item._id)}
                    className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              {selected?._id === item._id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-white/10">
                  <pre className="text-sm text-green-300 bg-black/40 rounded-xl p-4 overflow-x-auto font-mono whitespace-pre-wrap border border-white/10">
                    {item.generatedQuery}
                  </pre>
                  {item.description && <p className="text-sm text-gray-400 mt-3">{item.description}</p>}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary text-xs px-4 py-2 disabled:opacity-40">Previous</button>
          <span className="flex items-center text-sm text-gray-500 px-4">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="btn-secondary text-xs px-4 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default History;
