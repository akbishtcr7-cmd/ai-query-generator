import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import QueryGenerator from '../pages/QueryGenerator';
import History from '../pages/History';
import Favorites from '../pages/Favorites';
import Chat from '../pages/Chat';
import Sandbox from '../pages/Sandbox';
import Admin from '../pages/Admin';
import Profile from '../pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <Loader size="lg" text="Loading..." />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="query" element={<QueryGenerator />} />
      <Route path="history" element={<History />} />
      <Route path="favorites" element={<Favorites />} />
      <Route path="chat" element={<Chat />} />
      <Route path="sandbox" element={<Sandbox />} />
      <Route path="profile" element={<Profile />} />
      <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="admin/users" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="admin/audit" element={<AdminRoute><Admin /></AdminRoute>} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
