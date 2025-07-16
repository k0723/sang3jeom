export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="font-bold text-blue-400">상3점</span> © 2024. All rights reserved.
        </div>
        <div className="flex gap-4 text-gray-400 text-sm">
          <a href="#">회사소개</a>
          <a href="#">고객센터</a>
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
        </div>
      </div>
    </footer>
  );
} 