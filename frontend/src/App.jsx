import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import GoodsMaker from "./pages/GoodsMaker";
// import Cart from "./pages/Cart";
// import Order from "./pages/Order";
import MyPage from "./pages/MyPage";
import Navbar from "./components/Navbar";
// import Ranking from "./pages/Ranking";
// import Admin from "./pages/Admin";
// import Inquiry from "./pages/Inquiry";
import CharacterMaker from './pages/CharacterMaker';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import PaySuccess from "./pages/PaySuccess";
import OrderPage from "./pages/OrderPage";
import OrderComplete from "./pages/OrderComplete";
import Community from "./pages/Community";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import { AuthProvider } from "./components/AuthContext";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('isLoggedIn'));

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("isLoggedIn"));
    };

    checkLogin(); // 최초 1회 실행
    window.addEventListener("storage", checkLogin); // 탭 간 동기화

    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />  {/* 전역 상태는 useAuth()로 접근 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/goods-maker" element={<GoodsMaker />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order-complete" element={<OrderComplete />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/character-maker" element={<CharacterMaker />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/post/:id" element={<CommunityPostDetail />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/pay/success" element={<PaySuccess />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
