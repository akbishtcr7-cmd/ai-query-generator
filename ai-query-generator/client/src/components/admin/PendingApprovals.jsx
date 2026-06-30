import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { queryService } from '../../services/queryService';
import Loader from '../common/Loader';

const PendingApprovals = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [modifiedQuery, setModifiedQuery] = useState('');

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const { data } = await queryService.getPendingQueries({ status: 'pending' });
      setQueries(data.data.queries);
    } catch {} finally { setLoading(false); }
  };

  const handleReview = async (action) => {
    if (!reviewModal) return;
    try {
      await queryService.reviewQuery(reviewModal._id, { action, adminNotes, modifiedQuery });
      setReviewModal(null);
      setAdminNotes('');
      setModifiedQuery('');
      fetchPending();
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-12"><Loader text="Loading pending queries..." /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <FiClock className="text-amber-400" />
        <h3 className="text-lg font-bold text-white">Pending Approvals ({queries.length})</h3>
      </div>

      {queries.length === 0 ? (
        <div className="card text-center py-12">
          <FiCheck className="mx-auto text-green-400 mb-3" size={40} />
          <p className="text-gray-400">No pending queries — all caught up!</p>
        </div>
      ) : (
        queries.map((q, i) => (
          <motion.div key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FiAlertTriangle className="text-red-400" size={14} />
                  <span className="text-xs risk-critical px-2 py-0.5 rounded-full">CRITICAL</span>
                  <span className="text-xs text-gray-500">{q.databaseType}</span>
                  <span className="text-xs text-gray-600">{new Date(q.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2"><strong className="text-gray-400">Prompt:</strong> {q.prompt}</p>
                <pre className="text-xs bg-black/40 rounded-lg p-3 text-green-300 overflow-x-auto border border-white/10 font-mono">
                  {q.generatedQuery}
                </pre>
                {q.user && (
                  <p className="text-xs text-gray-500 mt-2">
                    By: <span className="text-gray-400">{q.user.name}</span> ({q.user.email})
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setReviewModal(q); setModifiedQuery(q.generatedQuery); }}
                  className="btn-primary text-xs px-3 py-1.5">Review</button>
              </div>
            </div>
          </motion.div>
        ))
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-dark rounded-2xl p-6 w-full max-w-2xl border border-white/10 space-y-4">
            <h4 className="font-bold text-white text-lg">Review Query</h4>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Query (editable)</label>
              <textarea value={modifiedQuery} onChange={(e) => setModifiedQuery(e.target.value)}
                rows={6} className="input-field font-mono text-xs text-green-300" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Admin Notes</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                rows={2} className="input-field text-sm" placeholder="Optional notes for the user..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleReview('approved')}
                className="flex-1 btn-primary flex items-center justify-center gap-2">
                <FiCheck size={14} /> Approve
              </button>
              <button onClick={() => handleReview('modified')}
                className="flex-1 btn-secondary flex items-center justify-center gap-2">
                Approve Modified
              </button>
              <button onClick={() => handleReview('rejected')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2">
                <FiX size={14} /> Reject
              </button>
              <button onClick={() => setReviewModal(null)} className="btn-secondary px-4">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
