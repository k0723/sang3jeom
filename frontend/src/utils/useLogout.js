// src/hooks/useLogout.js
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import axios from 'axios';

export function useLogout(setIsLoggedIn) {
  const navigate = useNavigate();

  return useCallback(async () => {
    console.log('🔒 start logout api');
        await axios.post('http://localhost:8080/logout',{}, { withCredentials: true });
        console.log('✅ logout API success');
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate('/login', { replace: true });
  }, [navigate, setIsLoggedIn]);
}
