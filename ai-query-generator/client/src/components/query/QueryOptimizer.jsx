import { motion } from 'framer-motion';
import { FiZap, FiCheckCircle } from 'react-icons/fi';

const QueryOptimizer = ({ suggestions }) => {
  if (!suggestions || !suggestions.length) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <FiZap className="text-amber-400" /> Optimization Suggestions
      </h3>
      <ul className="space-y-2">
        {suggestions.map((s, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 glass rounded-xl"
          >
            <FiCheckCircle className="text-purple-400 flex-shrink-0 mt-0.5" size={16} />
            <span className="text-sm text-gray-300">{s}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default QueryOptimizer;
