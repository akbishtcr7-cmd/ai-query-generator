import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiSave, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const profileForm = useForm({ defaultValues: { name: user?.name, avatar: user?.avatar } });
  const passwordForm = useForm();

  const onProfileSave = async (data) => {
    try {
      setMessage(''); setError('');
      const { data: res } = await authService.updateProfile(data);
      updateUser(res.data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const onPasswordChange = async (data) => {
    try {
      setMessage(''); setError('');
      await authService.changePassword(data);
      setMessage('Password changed successfully!');
      passwordForm.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-white">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <FiShield size={12} className="text-purple-400" />
            <span className="text-xs text-purple-400 capitalize">{user?.role}</span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-white">{user?.totalQueries || 0}</p>
          <p className="text-xs text-gray-500">Total Queries</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {['profile', 'security'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm capitalize border-b-2 transition-all ${
              activeTab === t ? 'text-white border-purple-500' : 'text-gray-500 border-transparent'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {(message || error) && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${
          message ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message || error}
        </div>
      )}

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><FiUser className="text-purple-400" /> Personal Info</h3>
          <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
              <input type="text" className="input-field" {...profileForm.register('name', { required: true })} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input type="email" value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
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
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><FiLock className="text-purple-400" /> Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
            {['currentPassword', 'newPassword', 'confirmPassword'].map(field => (
              <div key={field}>
                <label className="text-sm text-gray-400 mb-1.5 block capitalize">
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <input type="password" className="input-field" {...passwordForm.register(field, { required: true })} />
              </div>
            ))}
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FiLock size={14} /> Update Password
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
