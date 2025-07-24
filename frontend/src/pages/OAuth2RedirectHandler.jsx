// pages/OAuth2RedirectHandler.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2RedirectHandler = ({ setIsLoggedIn }) => {
  const [searchParams] = useSearchParams();              // :contentReference[oaicite:0]{index=0}
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // 1) JWT 토큰 저장
      sessionStorage.setItem('jwt', token);
      localStorage.setItem('jwt', token);

      // 2) 로그인 상태 플래그 저장
      localStorage.setItem('isLoggedIn', 'true');

      // 3) React state 동기화
      setIsLoggedIn(true);

      // 4) 홈으로 리다이렉트
      navigate('/', { replace: true });
    } else {
      // 토큰이 누락된 경우 로그인 페이지로 돌려보냄
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setIsLoggedIn]);

  return null;
};

export default OAuth2RedirectHandler;
