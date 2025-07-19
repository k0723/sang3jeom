import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { useState } from "react";
import OrderPage from "./pages/OrderPage";
import OrderComplete from "./pages/OrderComplete";
import Community from "./pages/Community";
import CommunityPostDetail from "./pages/CommunityPostDetail";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('isLoggedIn'));
  return (
    <BrowserRouter>
      <Navbar 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/goods-maker" element={<GoodsMaker />} />
        {/* <Route path="/cart" element={<Cart />} /> */}
        {/* <Route path="/order" element={<Order />} /> */}
        <Route path="/order" element={<OrderPage />} />
        <Route path="/order-complete" element={<OrderComplete />} />
        <Route path="/mypage" element={<MyPage />} />
        {/* <Route path="/ranking" element={<Ranking />} /> */}
        {/* <Route path="/admin" element={<Admin />} /> */}
        {/* <Route path="/inquiry" element={<Inquiry />} /> */}
        <Route path="/character-maker" element={<CharacterMaker />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/post/:id" element={<CommunityPostDetail />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/pay-success" element={<PaySuccess />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
