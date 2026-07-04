import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiMic, FiLoader } from 'react-icons/fi';
import DatabaseSelector from './DatabaseSelector';

const EXAMPLES = [
  'Show all customers who purchased more than ₹5000 in the last 30 days',
  'Find top 10 products by total revenue this month',
  'List employees who joined in the last year with their department names',
  'Get all orders that are pending and placed before yesterday',
  'Count users grouped by their country',
];

const QueryInput = ({ onGenerate, loading, selectedDb, onDbChange }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    await onGenerate(prompt.trim(), selectedDb);
  };

  const handleExample = (ex) => {
    setPrompt(ex);
    textareaRef.current?.focus();
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (e) => setPrompt(e.results[0][0].transcript);
    recognition.start();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">AI Query Generator</h2>
        <p className="text-gray-500 text-sm">Describe your data requirement in plain English</p>
      </div>

      <DatabaseSelector value={selectedDb} onChange={onDbChange} />

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Show all users who signed up last month and made at least one purchase..."
            rows={4}
            className="input-field resize-none pr-12"
            maxLength={2000}
          />
          <button type="button" onClick={handleVoice}
            className="absolute right-3 top-3 text-gray-500 hover:text-purple-400 transition-colors" title="Voice input">
            <FiMic size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{prompt.length}/2000</span>
          <motion.button
            type="submit"
            disabled={!prompt.trim() || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <><FiLoader className="animate-spin" size={16} /> Generating...</> : <><FiZap size={16} /> Generate Query</>}
          </motion.button>
        </div>
      </form>

      <div>
        <p className="text-xs text-gray-600 mb-2">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => handleExample(ex)}
              className="text-xs px-3 py-1.5 glass rounded-lg text-gray-400 hover:text-purple-400 hover:border-purple-500/40 border border-white/10 transition-all truncate max-w-xs">
              {ex.substring(0, 45)}...
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default QueryInput;
