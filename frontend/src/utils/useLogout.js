// src/hooks/useLogout.js
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { createApiInstance } from './axiosInstance';

const authApi = createApiInstance('http://localhost:8080');

export function useLogout(setIsLoggedIn) {
  const navigate = useNavigate();

  return useCallback(async () => {
    console.log('🔒 start logout api');
    await authApi.post('/logout', {});
    console.log('✅ logout API success');
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate('/login', { replace: true });
  }, [navigate, setIsLoggedIn]);
}
