import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiLoader, FiUser, FiCpu, FiTrash2 } from 'react-icons/fi';
import { queryService } from '../../services/queryService';

const SUGGESTIONS = [
  'Explain this query to me',
  'How can I optimize this query?',
  'Convert SQL to MongoDB',
  'Why might this query be slow?',
  'Suggest indexes for better performance',
  'What are the best practices for JOIN queries?',
];

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI database assistant. Ask me anything about queries, optimization, or database concepts.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { data } = await queryService.chat({ messages: newMessages });
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Chat cleared! How can I help you?' }]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">AI Chat Assistant</h2>
          <p className="text-gray-500 text-sm">Ask anything about databases and queries</p>
        </div>
        <button onClick={clearChat} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
          <FiTrash2 size={12} /> Clear
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.slice(0, 4).map((s, i) => (
          <button key={i} onClick={() => sendMessage(s)}
            className="text-xs px-3 py-1.5 glass rounded-lg text-gray-400 hover:text-purple-400 hover:border-purple-500/40 border border-white/10 transition-all">
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0 max-h-96">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'glass'
              }`}>
                {msg.role === 'user' ? <FiUser size={14} className="text-white" /> : <FiCpu size={14} className="text-purple-400" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-purple-600/50 to-blue-600/30 border border-purple-500/30 text-white'
                  : 'glass text-gray-200'
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
              <FiCpu size={14} className="text-purple-400" />
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <FiLoader className="animate-spin text-purple-400" size={14} />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about queries, optimization, database design..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="btn-primary px-4 disabled:opacity-50">
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
