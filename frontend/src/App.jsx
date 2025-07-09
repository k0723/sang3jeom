import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// import GoodsMaker from "./pages/GoodsMaker";
// import Cart from "./pages/Cart";
// import Order from "./pages/Order";
// import MyPage from "./pages/MyPage";
// import Ranking from "./pages/Ranking";
// import Admin from "./pages/Admin";
// import Inquiry from "./pages/Inquiry";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/goods-maker" element={<GoodsMaker />} /> */}
        {/* <Route path="/cart" element={<Cart />} /> */}
        {/* <Route path="/order" element={<Order />} /> */}
        {/* <Route path="/mypage" element={<MyPage />} /> */}
        {/* <Route path="/ranking" element={<Ranking />} /> */}
        {/* <Route path="/admin" element={<Admin />} /> */}
        {/* <Route path="/inquiry" element={<Inquiry />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
