import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_AUTH_KEY = 'admin_authenticated';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    const storedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    
    if (auth === 'true' && storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
    }
  }, []);

  const login = useCallback((jwtToken: string) => {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    sessionStorage.setItem(ADMIN_TOKEN_KEY, jwtToken);
    setIsAuthenticated(true);
    setToken(jwtToken);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAuthenticated(false);
    setToken(null);
  }, []);

  const getToken = useCallback((): string | null => {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  }, []);

  return { isAuthenticated, token, login, logout, getToken };
}

// Helper to call admin API with JWT token
export async function callAdminApi(action: string, payload: Record<string, unknown> = {}) {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.functions.invoke('admin-api', {
    body: { action, token, ...payload }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Login function that validates password and returns JWT
export async function adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke('admin-api', {
    body: { action: 'login', password }
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.error) {
    return { success: false, error: data.error };
  }

  if (data?.success && data?.token) {
    return { success: true, token: data.token };
  }

  return { success: false, error: 'Unexpected response from server' };
}
