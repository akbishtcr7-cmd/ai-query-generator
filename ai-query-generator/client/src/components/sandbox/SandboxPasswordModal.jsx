import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiX, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

const SandboxPasswordModal = ({ open, onConfirm, onCancel, queryPreview }) => {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!password.trim()) { setError('Password is required'); return; }
    setError('');
    onConfirm(password);
    setPassword('');
  };

  const handleCancel = () => { setPassword(''); setError(''); onCancel(); };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCancel} />

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            className="relative glass-dark rounded-2xl border border-red-500/30 p-6 w-full max-w-md shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <FiShield className="text-red-400" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Privileged Operation</h3>
                  <p className="text-xs text-red-400">Sandbox password required</p>
                </div>
              </div>
              <button onClick={handleCancel} className="text-gray-500 hover:text-white transition-colors">
                <FiX size={18} />
              </button>
            </div>

            {/* Warning */}
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs text-amber-300 font-medium mb-1">⚠️ Sensitive Operation Detected</p>
              <p className="text-xs text-amber-400/70">
                This query contains a privileged operation (GRANT / REVOKE / DROP / TRUNCATE).
                Enter your sandbox password to simulate it safely on virtual data.
              </p>
            </div>

            {/* Query preview */}
            {queryPreview && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Query to simulate:</p>
                <pre className="text-xs text-green-300 bg-black/40 rounded-lg p-3 font-mono overflow-x-auto border border-white/10 whitespace-pre-wrap">
                  {queryPreview.substring(0, 200)}{queryPreview.length > 200 ? '...' : ''}
                </pre>
              </div>
            )}

            {/* Password input */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-1.5">
                <FiLock size={13} /> Sandbox Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                  placeholder="Enter sandbox password..."
                  autoFocus
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              <p className="text-xs text-gray-600 mt-1">
                This only authorizes a virtual simulation — your real database is never touched.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleCancel} className="flex-1 btn-secondary py-2.5">Cancel</button>
              <button onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>
                <FiShield size={14} /> Proceed Safely
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SandboxPasswordModal;
