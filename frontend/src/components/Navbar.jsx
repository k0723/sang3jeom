import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, User, ShoppingCart, Heart, LogIn, UserPlus, Home, Palette, ChevronDown, LogOut, Users
} from 'lucide-react';
import Modal from './Modal';
import reactImg from '../assets/react.svg';
import { useLogout } from '../utils/useLogout';
import { useAuth } from "../utils/useAuth";

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef();
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  // 로그인 체크 함수
  const handleAuthRequiredClick = (path) => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return false;
    }
    return true;
  };


  const navItems = [
    { name: '홈', path: '/', icon: Home, requiresAuth: false },
    { name: 'AI 캐릭터', path: '/character-maker', icon: Palette, requiresAuth: true },
    { name: '굿즈 제작', path: '/goods-maker', icon: ShoppingCart, requiresAuth: true },
    { name: '상상공간', path: '/community', icon: Users, requiresAuth: false },
    { name: '홈', path: '/', icon: Home, requiresAuth: false },
    { name: 'AI 캐릭터', path: '/character-maker', icon: Palette, requiresAuth: true },
    { name: '굿즈 제작', path: '/goods-maker', icon: ShoppingCart, requiresAuth: true },
    { name: '상상공간', path: '/community', icon: Users, requiresAuth: false },
  ];

  const avatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face';

  const logout = useLogout(setIsLoggedIn);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      bg-white/80 backdrop-blur-lg shadow-xl border-b border-gray-200
      rounded-b-2xl
      ${isScrolled ? 'shadow-2xl' : ''}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-105 transition-transform"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-white font-bold text-2xl tracking-tight">상</span>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight">상상상점</h1>
              <p className="text-xs text-gray-500 font-medium">AI 굿즈 제작소</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  if (item.requiresAuth && !handleAuthRequiredClick(item.path)) {
                    e.preventDefault();
                  }
                }}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-base transition-all duration-200 relative
                  ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}
                  group
                `}
              >
                {item.icon && <item.icon className="w-5 h-5 opacity-70" />}
                <span>{item.name}</span>
                <span className={`absolute left-1/2 -bottom-1 w-6 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-80 transition-all duration-200 ${location.pathname === item.path ? 'opacity-100' : ''}`}></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth/User */}
          <div className="hidden md:flex items-center space-x-2">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="px-5 py-2 rounded-lg font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200 flex items-center gap-1">
                  <LogIn className="w-4 h-4" /> 로그인
                </Link>
                <Link to="/signup" className="px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center gap-1">
                  <UserPlus className="w-4 h-4" /> 회원가입
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowDropdown((v) => !v)}
                >
                  <img src={avatarUrl} alt="마이페이지" className="w-8 h-8 rounded-full border-2 border-blue-400 shadow" />
                  <span className="font-semibold text-gray-800">마이페이지</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
                    >
                      <Link to="/mypage" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4" /> 내 정보
                      </Link>
                      <Link to="/mypage?tab=orders" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50">
                        <ShoppingCart className="w-4 h-4" /> 주문내역
                      </Link>
                      <Link to="/mypage?tab=favorites" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50">
                        <Heart className="w-4 h-4" /> 찜한 상품
                      </Link>
                      <div className="border-t my-1" />
                      <button className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 w-full" onClick={logout}>
                        <LogOut className="w-4 h-4" /> 로그아웃
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl rounded-b-2xl z-50"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Main Navigation */}
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => {
                      if (item.requiresAuth && !handleAuthRequiredClick(item.path)) {
                        e.preventDefault();
                      } else {
                        setIsOpen(false);
                      }
                    }}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Auth/User Navigation */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-semibold text-lg transition-all duration-200"
                    >
                      <LogIn className="w-5 h-5" /> 로그인
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 font-semibold text-lg transition-all duration-200"
                    >
                      <UserPlus className="w-5 h-5" /> 회원가입
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center space-x-3 px-3 py-3">
                    <img src={avatarUrl} alt="마이페이지" className="w-8 h-8 rounded-full border-2 border-blue-400 shadow" />
                    <span className="font-semibold text-gray-800">마이페이지</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 