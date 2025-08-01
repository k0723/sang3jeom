// pages/OAuth2RedirectHandler.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "../utils/useAuth";

const OAuth2RedirectHandler = () => {  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn,setIsLoggedIn } = useAuth();
 useEffect(() => {
    (async () => {
      try {
        // 1️⃣ URL에서 accessToken 먼저 읽기
        const token = searchParams.get("accessToken");
        console.log("🔹 URL에서 받은 accessToken:", token);

        if (token) {
          // 2️⃣ local/sessionStorage에 저장
          localStorage.setItem('accessToken', token);
          sessionStorage.setItem('accessToken', token);
        }

        // 3️⃣ 서버에 사용자 정보 요청 (쿠키 + 토큰 둘 다 가능)
        const { data } = await axios.get('http://localhost:8080/users/me', {
          withCredentials: true, // HttpOnly 쿠키 전송
          headers: {
            Authorization: `Bearer ${token}`, // ★ 백엔드에서 허용하면 헤더로도 보냄
          },
        });

        console.log("🔹 사용자 정보:", data);
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);

        // 4️⃣ 홈으로 이동
        navigate('/', { replace: true });
      } catch (e) {
        console.error("OAuth2RedirectHandler 에러:", e);
        navigate('/login?error=oauth', { replace: true });
      }
    })();
  }, [navigate, searchParams, setIsLoggedIn]);

  return null;
};

export default OAuth2RedirectHandler;
