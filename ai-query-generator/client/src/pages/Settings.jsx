import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiDatabase, FiBell, FiLock, FiAlertTriangle, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '../context/QueryContext';
import { supabase } from '../lib/supabase';

const DB_OPTIONS = ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'SQL Server'];

const Settings = () => {
  const { user, logout } = useAuth();
  const { selectedDb, setSelectedDb } = useQuery();

  const [notifyOnRisk, setNotifyOnRisk] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  // Load saved preferences (per-browser, local only)
  useEffect(() => {
    const saved = localStorage.getItem('queryai:preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.notifyOnRisk !== undefined) setNotifyOnRisk(parsed.notifyOnRisk);
        if (parsed.emailDigest !== undefined) setEmailDigest(parsed.emailDigest);
      } catch {
        // ignore malformed local data
      }
    }
  }, []);

  const savePreferences = () => {
    setMessage(''); setError('');
    localStorage.setItem(
      'queryai:preferences',
      JSON.stringify({ notifyOnRisk, emailDigest })
    );
    setMessage('Preferences saved.');
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    if (!newPassword || newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setSaving(true);
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setMessage('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const onSignOutEverywhere = async () => {
    setMessage(''); setError('');
    try {
      setSigningOutAll(true);
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
      if (signOutError) throw signOutError;
      await logout();
    } catch (err) {
      setError(err.message || 'Failed to sign out of all sessions');
      setSigningOutAll(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiSettings className="text-purple-400" /> Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage preferences, security, and your account</p>
      </div>

      {(message || error) && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${
          message ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message || error}
        </div>
      )}

      {/* Preferences */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FiDatabase className="text-purple-400" /> Preferences
        </h3>

        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Default Database Type</label>
          <select
            value={selectedDb}
            onChange={(e) => setSelectedDb(e.target.value)}
            className="input-field"
          >
            {DB_OPTIONS.map((db) => (
              <option key={db} value={db}>{db}</option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-1">Used as the default selection in Query Generator.</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <FiBell className="text-gray-400" size={14} />
            <div>
              <p className="text-sm text-gray-300">Warn me on risky queries</p>
              <p className="text-xs text-gray-600">Show an alert when a generated query needs admin approval</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotifyOnRisk((v) => !v)}
            className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${
              notifyOnRisk ? 'bg-purple-500' : 'bg-white/10'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
              notifyOnRisk ? 'left-5' : 'left-0.5'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiBell className="text-gray-400" size={14} />
            <div>
              <p className="text-sm text-gray-300">Weekly email digest</p>
              <p className="text-xs text-gray-600">Summary of your query activity (coming soon)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEmailDigest((v) => !v)}
            className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${
              emailDigest ? 'bg-purple-500' : 'bg-white/10'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
              emailDigest ? 'left-5' : 'left-0.5'
            }`} />
          </button>
        </div>

        <button onClick={savePreferences} className="btn-primary flex items-center gap-2">
          <FiSave size={14} /> Save Preferences
        </button>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FiLock className="text-purple-400" /> Security
        </h3>
        <p className="text-xs text-gray-600">Signed in as {user?.email}</p>

        <form onSubmit={onChangePassword} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">New Password</label>
            <input
              type="password"
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Confirm New Password</label>
            <input
              type="password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <FiLock size={14} /> {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4 border border-red-500/20">
        <h3 className="font-semibold text-red-400 flex items-center gap-2">
          <FiAlertTriangle /> Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Sign out of all devices</p>
            <p className="text-xs text-gray-600">This will end every active session, including this one</p>
          </div>
          <button
            onClick={onSignOutEverywhere}
            disabled={signingOutAll}
            className="btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/10 disabled:opacity-50"
          >
            {signingOutAll ? 'Signing out...' : 'Sign Out Everywhere'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;