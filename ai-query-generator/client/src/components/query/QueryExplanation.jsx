import { motion } from 'framer-motion';
import { FiInfo, FiTable, FiFilter, FiLink, FiArrowDown, FiBarChart2, FiLayers } from 'react-icons/fi';

const ExplainRow = ({ icon, label, value }) => {
  if (!value || (Array.isArray(value) && !value.length)) return null;
  return (
    <div className="flex gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg glass flex items-center justify-center text-purple-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm text-gray-200">{Array.isArray(value) ? value.join(', ') : value}</p>
      </div>
    </div>
  );
};

const QueryExplanation = ({ explanation }) => {
  if (!explanation) return null;
  const e = explanation;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <FiInfo className="text-purple-400" /> Query Explanation
      </h3>
      <ExplainRow icon={<FiInfo size={14} />} label="Purpose" value={e.purpose} />
      <ExplainRow icon={<FiTable size={14} />} label="Tables Involved" value={e.tablesInvolved} />
      <ExplainRow icon={<FiFilter size={14} />} label="Conditions Used" value={e.conditionsUsed} />
      <ExplainRow icon={<FiLink size={14} />} label="Joins Used" value={e.joinsUsed} />
      <ExplainRow icon={<FiArrowDown size={14} />} label="Sorting Logic" value={e.sortingLogic} />
      <ExplainRow icon={<FiBarChart2 size={14} />} label="Aggregations" value={e.aggregations} />
      <ExplainRow icon={<FiLayers size={14} />} label="Grouping Logic" value={e.groupingLogic} />
    </motion.div>
  );
};

export default QueryExplanation;
