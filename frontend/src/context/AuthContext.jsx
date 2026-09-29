import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  checkGatewayHealth,
} from '../api/client';
import { loginWithCredentials, DEMO_ACCOUNTS, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => {
    const existing = getStoredUser();
    // Default to Pat Participant for instantaneous demo exploration if nothing is stored
    return existing || {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'participant1@hackathonraptors.dev',
      firstName: 'Pat',
      lastName: 'Participant',
      primaryRole: 'PARTICIPANT',
    };
  });
  const [isGatewayOnline, setIsGatewayOnline] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsCheckingBackend(true);
    const online = await checkGatewayHealth();
    setIsGatewayOnline(online);
    setIsCheckingBackend(false);
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const result = await loginWithCredentials(username, password);
      setToken(result.token);
      setUser(result.user);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const switchDemoAccount = async (account) => {
    setLoading(true);
    try {
      const result = await loginWithCredentials(account.username, account.password);
      setToken(result.token);
      setUser(result.user);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setToken(null);
    setUser(null);
  };

  const role = user?.primaryRole || 'GUEST';
  const isParticipant = role === 'PARTICIPANT';
  const isJudge = role === 'JUDGE';
  const isOrganizer = role === 'ORGANIZER' || role === 'ADMIN';
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role,
      isAuthenticated: !!user,
      isParticipant,
      isJudge,
      isOrganizer,
      isAdmin,
      isGatewayOnline,
      isCheckingBackend,
      checkHealth,
      login,
      logout,
      switchDemoAccount,
      demoAccounts: DEMO_ACCOUNTS,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
