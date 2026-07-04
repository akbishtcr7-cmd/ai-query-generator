import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const getAuthErrorMessage = (error) => {
  const message = error?.message || '';
  const code = error?.code || '';

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return 'Invalid email or password. If you just signed up, confirm your email first.';
  }

  if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) {
    return 'Please confirm your email address before signing in.';
  }

  if (code === 'signup_disabled' || /signups not allowed/i.test(message)) {
    return 'Sign ups are disabled for this Supabase project.';
  }

  if (code === 'weak_password' || /password/i.test(message)) {
    return message;
  }

  return message || 'Authentication failed. Please try again.';
};

const toAuthError = (error) => new Error(getAuthErrorMessage(error));

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw toAuthError(error);
    return data;
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw toAuthError(error);
    return data;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // ── Update profile ────────────────────────────────────────────────────────
  const updateUser = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({ data: updates });
    if (error) throw error;
    setUser(data.user);
    return data.user;
  };

  // ── Password reset ────────────────────────────────────────────────────────
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw toAuthError(error);
  };

  // Helpers
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const role        = user?.user_metadata?.role || 'user';
  const isAdmin     = role === 'admin' || role === 'superadmin';

  // Expose Supabase access token for backend calls
  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      displayName, role, isAdmin,
      login, register, logout, updateUser, resetPassword, getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
