import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiZap, FiClock, FiHeart, FiMessageSquare,
  FiShield, FiUsers, FiFileText, FiX, FiDatabase, FiServer,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
  { to: '/query', icon: <FiZap />, label: 'Query Generator' },
  { to: '/sandbox', icon: <FiServer />, label: 'Query Sandbox' },
  { to: '/history', icon: <FiClock />, label: 'History' },
  { to: '/favorites', icon: <FiHeart />, label: 'Favorites' },
  { to: '/chat', icon: <FiMessageSquare />, label: 'AI Chat' },
];

const adminItems = [
  { to: '/admin', icon: <FiShield />, label: 'Admin Panel' },
  { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
  { to: '/admin/audit', icon: <FiFileText />, label: 'Audit Logs' },
];

const Sidebar = ({ open, onClose }) => {
  const { isAdmin } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10 md:hidden">
        <span className="font-bold gradient-text">QueryAI</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-gray-600 uppercase tracking-wider px-3 mb-3">Main Menu</p>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} onClick={onClose}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="my-4 border-t border-white/10" />
            <p className="text-xs text-gray-600 uppercase tracking-wider px-3 mb-3">Admin</p>
            {adminItems.map(item => (
              <NavLink key={item.to} to={item.to} onClick={onClose}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="glass rounded-xl p-3 text-center">
          <FiDatabase className="mx-auto text-purple-400 mb-1" />
          <p className="text-xs text-gray-400">AI-Powered</p>
          <p className="text-xs text-gray-500">Query Generator</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 glass-dark border-r border-white/10 fixed left-0 top-16 bottom-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onClose} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-72 glass-dark border-r border-white/10 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
