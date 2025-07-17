import { useNavigate } from 'react-router-dom';

export function Logout(setIsLoggedIn) {
  const navigate = useNavigate();
  return () => {
    localStorage.clear();
    sessionStorage.clear();
    if (setIsLoggedIn) setIsLoggedIn(false);
    navigate('/login', { replace: true });
  };
}