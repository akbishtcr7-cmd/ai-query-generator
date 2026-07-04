import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiUser, FiLogOut, FiSettings, FiDatabase } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="text-gray-400 hover:text-white md:hidden">
            <FiMenu size={22} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <FiDatabase className="text-white" size={16} />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">QueryAI</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-purple-500/50 transition-all"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-300 hidden sm:block">{displayName}</span>
            </button>

            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 w-52 glass-dark rounded-xl border border-white/10 overflow-hidden shadow-xl z-50"
              >
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 capitalize">
                    {user?.user_metadata?.role || 'user'}
                  </span>
                </div>
                {[
                  { to: '/profile', icon: <FiUser size={14} />, label: 'Profile' },
                  { to: '/settings', icon: <FiSettings size={14} />, label: 'Settings' },
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                    {item.icon} {item.label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                  <FiLogOut size={14} /> Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;