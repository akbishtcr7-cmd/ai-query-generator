import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiDownload, FiAlignLeft, FiMinimize2, FiCheck, FiHeart } from 'react-icons/fi';
import { queryService } from '../../services/queryService';
import { toast } from '../../utils/toast';

const RISK_STYLES = {
  SAFE: 'risk-safe',
  WARNING: 'risk-warning',
  CRITICAL: 'risk-critical',
};

const QueryOutput = ({ result, onFavorite }) => {
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState(result?.generatedQuery || '');
  const [isFav, setIsFav] = useState(result?.isFavorite || false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = async () => {
    try {
      const { data } = await queryService.format({ query, databaseType: result.databaseType, action: 'format' });
      setQuery(data.data.formattedQuery);
    } catch {}
  };

  const handleMinify = async () => {
    try {
      const { data } = await queryService.format({ query, databaseType: result.databaseType, action: 'minify' });
      setQuery(data.data.formattedQuery);
    } catch {}
  };

  const handleDownload = (ext) => {
    const blob = new Blob([query], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query.${ext}`;
    a.click();
  };

  const handleFavorite = async () => {
    try {
      if (isFav) {
        await queryService.removeFavorite(result.historyId);
      } else {
        await queryService.addFavorite(result.historyId, {});
      }
      setIsFav(!isFav);
      onFavorite?.(!isFav);
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-white">Generated Query</h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${RISK_STYLES[result.riskLevel] || 'risk-safe'}`}>
            {result.riskLevel}
          </span>
          {result.requiresAdminApproval && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
              Pending Admin Approval
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleFormat} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <FiAlignLeft size={12} /> Format
          </button>
          <button onClick={handleMinify} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <FiMinimize2 size={12} /> Minify
          </button>
          <button onClick={handleCopy} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            {copied ? <FiCheck size={12} className="text-green-400" /> : <FiCopy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <div className="relative group">
            <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <FiDownload size={12} /> Export
            </button>
            <div className="absolute right-0 top-9 glass-dark rounded-xl border border-white/10 py-1 w-28 hidden group-hover:block z-10">
              {['sql', 'txt', 'json'].map(ext => (
                <button key={ext} onClick={() => handleDownload(ext)}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 uppercase">
                  .{ext}
                </button>
              ))}
            </div>
          </div>
          {result.historyId && (
            <button onClick={handleFavorite}
              className={`btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 ${isFav ? 'text-red-400' : ''}`}>
              <FiHeart size={12} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <pre className="bg-black/40 rounded-xl p-4 text-sm text-green-300 overflow-x-auto border border-white/10 font-mono leading-relaxed whitespace-pre-wrap">
          {query}
        </pre>
      </div>

      {result.description && (
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Explanation</p>
          <p className="text-gray-300 text-sm">{result.description}</p>
        </div>
      )}
    </motion.div>
  );
};

export default QueryOutput;
