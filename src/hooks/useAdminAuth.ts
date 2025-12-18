import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_PASSWORD_KEY = 'admin_password';
const ADMIN_AUTH_KEY = 'admin_authenticated';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    const storedPassword = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
    
    if (auth === 'true' && storedPassword) {
      setIsAuthenticated(true);
      setPassword(storedPassword);
    }
  }, []);

  const login = useCallback((pwd: string) => {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    sessionStorage.setItem(ADMIN_PASSWORD_KEY, pwd);
    setIsAuthenticated(true);
    setPassword(pwd);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setIsAuthenticated(false);
    setPassword(null);
  }, []);

  const getPassword = useCallback((): string | null => {
    return sessionStorage.getItem(ADMIN_PASSWORD_KEY);
  }, []);

  return { isAuthenticated, password, login, logout, getPassword };
}

// Helper to call admin API with password
export async function callAdminApi(action: string, payload: Record<string, unknown> = {}) {
  const password = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
  
  if (!password) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.functions.invoke('admin-api', {
    body: { action, password, ...payload }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
