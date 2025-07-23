// pages/OAuth2RedirectHandler.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const OAuth2RedirectHandler = ({ setIsLoggedIn }) => {           // :contentReference[oaicite:0]{index=0}
  const navigate = useNavigate();

  useEffect(() => {
      (async () => {
        try {
          const { data } = await axios.get('http://localhost:8080/users/me', {
            withCredentials: true, // ★ 쿠키 전송
          });
          // 성공 시
          setIsLoggedIn(true);
          // 사용자 정보 전역 저장도 여기서
          navigate('/', { replace: true });
        } catch (e) {
          navigate('/login?error=oauth', { replace: true });
        }
      })();
    }, [navigate, setIsLoggedIn]);

  return null;
};

export default OAuth2RedirectHandler;
