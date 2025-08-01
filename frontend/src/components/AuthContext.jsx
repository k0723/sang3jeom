// AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // ✅ 항상 false로 시작
  const [isLoading, setIsLoading] = useState(true);     // ✅ 로딩 상태 추가

  useEffect(() => {
    const checkLogin = () => {
      const storedLogin = localStorage.getItem("isLoggedIn") === "true";
      const accessToken = localStorage.getItem("accessToken");
      setIsLoggedIn(storedLogin && !!accessToken);  // 둘 다 만족해야 true
      setIsLoading(false);                          // ✅ 로딩 종료
    };

    checkLogin(); // 초기 1회 실행
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
