import { motion } from 'framer-motion';
import { FiLayers, FiActivity, FiHash, FiLink, FiAlertTriangle } from 'react-icons/fi';

const StatCard = ({ icon, label, value, color = 'purple' }) => {
  const colors = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
  };
  return (
    <div className={`rounded-xl p-4 bg-gradient-to-br border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        {icon} <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
};

const QueryStats = ({ result }) => {
  if (!result) return null;

  const scoreColor = result.performanceScore >= 80 ? 'green' : result.performanceScore >= 60 ? 'amber' : 'red';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4">
      <h3 className="font-bold text-white">Query Statistics</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={<FiLayers size={14} />} label="Complexity" value={result.complexity || 'Low'} color="purple" />
        <StatCard icon={<FiActivity size={14} />} label="Perf. Score" value={`${result.performanceScore || 0}/100`} color={scoreColor} />
        <StatCard icon={<FiHash size={14} />} label="Est. Rows" value={(result.estimatedRows || 0).toLocaleString()} color="blue" />
        <StatCard icon={<FiLink size={14} />} label="Joins" value={result.numberOfJoins ?? 0} color="blue" />
        <StatCard icon={<FiHash size={14} />} label="Query Length" value={`${result.queryLength || result.generatedQuery?.length || 0} chars`} color="purple" />
        <StatCard icon={<FiAlertTriangle size={14} />} label="Risk Level" value={result.riskLevel || 'SAFE'}
          color={result.riskLevel === 'SAFE' ? 'green' : result.riskLevel === 'WARNING' ? 'amber' : 'red'} />
      </div>

      {/* Performance bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-xs text-gray-500">
          <span>Performance Score</span>
          <span>{result.performanceScore || 0}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.performanceScore || 0}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              (result.performanceScore || 0) >= 80 ? 'bg-green-500' :
              (result.performanceScore || 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default QueryStats;
