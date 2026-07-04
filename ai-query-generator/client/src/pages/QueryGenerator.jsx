import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import { useQuery } from '../context/QueryContext';
import QueryInput from '../components/query/QueryInput';
import QueryOutput from '../components/query/QueryOutput';
import QueryStats from '../components/query/QueryStats';
import QueryExplanation from '../components/query/QueryExplanation';
import QueryOptimizer from '../components/query/QueryOptimizer';
import Loader from '../components/common/Loader';

const QueryGenerator = () => {
  const { currentQuery, loading, error, selectedDb, setSelectedDb, generateQuery } = useQuery();
  const [activeTab, setActiveTab] = useState('output');

  const handleGenerate = async (prompt, db) => {
    try {
      await generateQuery(prompt, db);
      setActiveTab('output');
    } catch {
      // QueryContext owns the visible error state.
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Query Generator</h1>
        <p className="text-gray-500 text-sm mt-1">Convert plain English to optimized database queries</p>
      </motion.div>

      <QueryInput onGenerate={handleGenerate} loading={loading} selectedDb={selectedDb} onDbChange={setSelectedDb} />

      {loading && (
        <div className="card flex justify-center py-12">
          <Loader text="Generating your query with Gemini AI..." />
        </div>
      )}

      {error && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card flex items-start gap-3 border-red-500/30 bg-red-500/5">
          <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Generation Failed</p>
            <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {currentQuery && !loading && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
              {['output', 'explanation', 'stats', 'optimizer'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm rounded-t-lg capitalize transition-all ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'output' && <QueryOutput result={currentQuery} />}
            {activeTab === 'explanation' && <QueryExplanation explanation={currentQuery.explanation} />}
            {activeTab === 'stats' && <QueryStats result={currentQuery} />}
            {activeTab === 'optimizer' && <QueryOptimizer suggestions={currentQuery.optimizationSuggestions} />}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QueryGenerator;
