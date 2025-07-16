// pages/OAuth2RedirectHandler.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2RedirectHandler = ({ setIsLoggedIn }) => {
  const [searchParams] = useSearchParams();              // :contentReference[oaicite:0]{index=0}
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      setIsLoggedIn(true);
      navigate('/', { replace: true });
    } else {
      // 토큰 누락 시 에러 처리 또는 로그인 페이지로 리다이렉트
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setIsLoggedIn]);

  return null; // 또는 스피너 로딩 컴포넌트 렌더링
};

export default OAuth2RedirectHandler;
