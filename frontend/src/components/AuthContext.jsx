// AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { isTokenValidFromStorage } from "../utils/jwtUtils";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = () => {
      const accessToken = localStorage.getItem("accessToken");
      
      // 토큰이 존재하고 유효한지 확인
      if (accessToken && isTokenValidFromStorage()) {
        setIsLoggedIn(true);
      } else {
        // 토큰이 없거나 유효하지 않으면 로그아웃 상태로 설정
        setIsLoggedIn(false);
        // 잘못된 토큰 정보 정리
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isLoggedIn");
      }
      
      setIsLoading(false);
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
