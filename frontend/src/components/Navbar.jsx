import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-2xl font-bold text-blue-600">상3점</Link>
        <div className="flex gap-6">
          <Link to="/goods-maker" className="hover:text-blue-600">굿즈 만들기</Link>
          <Link to="/ranking" className="hover:text-blue-600">랭킹</Link>
          <Link to="/mypage" className="hover:text-blue-600">마이페이지</Link>
        </div>
        <div className="flex gap-2">
          <Link to="/login" className="text-sm px-4 py-2 rounded hover:bg-blue-50">로그인</Link>
          <Link to="/signup" className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">회원가입</Link>
        </div>
      </div>
    </nav>
  );
} 