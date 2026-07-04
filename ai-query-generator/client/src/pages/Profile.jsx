import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUser, FiSave, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const role = user?.user_metadata?.role || 'user';

  const profileForm = useForm({
    defaultValues: {
      name: user?.user_metadata?.full_name || '',
      avatar: user?.user_metadata?.avatar_url || '',
    },
  });

  const onProfileSave = async (data) => {
    try {
      setMessage(''); setError('');
      await updateUser({ full_name: data.name, avatar_url: data.avatar });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
      </div>

      {/* User card */}
      <div className="card flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-white">{displayName}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <FiShield size={12} className="text-purple-400" />
            <span className="text-xs text-purple-400 capitalize">{role}</span>
          </div>
        </div>
      </div>

      {(message || error) && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${
          message ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message || error}
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><FiUser className="text-purple-400" /> Personal Info</h3>
        <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
            <input type="text" className="input-field" {...profileForm.register('name', { required: true })} />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
            <input type="email" value={user?.email || ''} disabled className="input-field opacity-50 cursor-not-allowed" />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Avatar URL</label>
            <input type="url" placeholder="https://..." className="input-field" {...profileForm.register('avatar')} />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <FiSave size={14} /> Save Changes
          </button>
        </form>
      </motion.div>

      <p className="text-xs text-gray-600">
        Want to change your password or manage sessions? Head to{' '}
        <a href="/settings" className="text-purple-400 hover:underline">Settings</a>.
      </p>
    </div>
  );
};

export default Profile;