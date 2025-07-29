import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLogout } from '../utils/useLogout';
import { getUserIdFromToken } from '../utils/jwtUtils';
import axios from 'axios';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut,
  Edit,
  Camera,
  Star,
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';

const MyPage = ({ setIsLoggedIn }) => {

  const navigate = useNavigate();
  const logout = useLogout(setIsLoggedIn);
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [createdAt, setCreatedAt] = useState('');


  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');

  const [aiImages, setAiImages] = useState([]);
  const [myGoods, setMyGoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalSpent: 0
  });
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // 굿즈 타입별 가격 정보
  const goodsPrices = {
    'mug': 3500,
    'tshirt': 7040,
    'ecobag': 4500,
    'case': 4500
  };

  // 굿즈 타입별 한글 이름
  const goodsNames = {
    'mug': 'AI 캐릭터 머그컵',
    'tshirt': 'AI 캐릭터 티셔츠',
    'ecobag': 'AI 캐릭터 에코백',
    'case': 'AI 캐릭터 폰케이스'
  };

  // 주문내역에서 상품명을 한글로 변환하는 함수
  const getGoodsDisplayName = (goodsName) => {
    if (!goodsName) return '상품명 없음';
    
    const lowerGoodsName = goodsName.toLowerCase();
    
    // goodsNames 객체에서 매칭되는 한글 이름 찾기
    for (const [key, value] of Object.entries(goodsNames)) {
      if (lowerGoodsName === key || lowerGoodsName.includes(key)) {
        return value;
      }
    }
    
    // 매칭되지 않으면 원래 이름 반환
    return goodsName;
  };

  const tabs = [
    { id: 'profile', name: '프로필', icon: User },
    { id: 'orders', name: '주문내역', icon: ShoppingBag },
    { id: 'ai', name: 'AI 캐릭터', icon: Star },
    { id: 'favorites', name: '내 굿즈', icon: Heart },
    { id: 'posts', name: '내가 쓴 글', icon: Edit }, // 내가 쓴 글 탭 추가
    { id: 'settings', name: '설정', icon: Settings }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'SHIPPING': return 'text-blue-600 bg-blue-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return '배송완료';
      case 'SHIPPING': return '배송중';
      case 'PENDING': return '제작중';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle;
      case 'SHIPPING': return Truck;
      case 'PENDING': return Package;
      default: return Package;
    }
  };

  // 주문 통계 가져오기
  const fetchOrderStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("JWT 토큰이 없습니다. 주문 통계를 불러올 수 없습니다.");
        return;
      }

      const response = await axios.get('http://localhost:8082/orders/my-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("주문 통계:", response.data);
      setOrderStats(response.data);
    } catch (error) {
      console.error("주문 통계 불러오기 실패:", error);
      if (error.response?.status === 401) {
        console.log("인증 실패 - 로그인 페이지로 이동");
        navigate('/login');
      }
    }
  };

  // 내가 쓴 글 가져오기
  const fetchMyPosts = async () => {
    try {
      setPostsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("JWT 토큰이 없습니다. 내가 쓴 글을 불러올 수 없습니다.");
        return;
      }

      const response = await axios.get('http://localhost:8083/goods-posts/my-posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("내가 쓴 글:", response.data);
      setMyPosts(response.data);
    } catch (error) {
      console.error("내가 쓴 글 불러오기 실패:", error);
      if (error.response?.status === 401) {
        console.log("인증 실패 - 로그인 페이지로 이동");
        navigate('/login');
      }
    } finally {
      setPostsLoading(false);
    }
  };

  // 굿즈 가져오기
  const fetchGoods = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("JWT 토큰이 없습니다. 굿즈를 불러올 수 없습니다.");
      return;
    }
    
    const userId = getUserIdFromToken();
    if (!userId) {
      console.log("유저 정보를 확인할 수 없습니다.");
      return;
    }
    
    try {
      console.log("굿즈 조회 API 호출 - userId:", userId);
      const res = await fetch(`http://localhost:8080/api/user-goods?userId=${userId}`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("굿즈 조회 API 응답 상태:", res.status);
      
                        if (res.ok) {
                    const data = await res.json();
                    console.log("굿즈 데이터:", data);
                    console.log("굿즈 개수:", data.length);
                    
                    // 각 굿즈의 상세 정보 로깅
                    data.forEach((goods, index) => {
                      console.log(`굿즈 ${index + 1}:`, {
                        id: goods.id,
                        goodsType: goods.goodsType,
                        imageUrl: goods.imageUrl,
                        createdAt: goods.createdAt,
                        userId: goods.userId,
                        userName: goods.userName
                      });
                    });
                    
                    setMyGoods(data);
                  } else {
                    console.error("굿즈 불러오기 실패:", res.status);
                    const errorText = await res.text();
                    console.error("에러 내용:", errorText);
                  }
    } catch (error) {
      console.error("굿즈 불러오기 오류:", error);
    }
  };

  // 주문내역 가져오기
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("JWT 토큰이 없습니다. 주문내역을 불러올 수 없습니다.");
        return;
      }

      const response = await axios.get('http://localhost:8082/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("주문내역:", response.data);
      setOrders(response.data);
    } catch (error) {
      console.error("주문내역 불러오기 실패:", error);
      if (error.response?.status === 401) {
        console.log("인증 실패 - 로그인 페이지로 이동");
        navigate('/login');
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    handleUserInfo();
    fetchOrderStats(); // 주문 통계도 함께 가져오기
  }, [])

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'posts' && user) {
      fetchMyPosts();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'favorites' && user) {
      fetchGoods();
    }
  }, [activeTab, user]);

  const handleUserInfo = async () => {
    try {
      // JWT 토큰 확인 - localStorage에서 가져오기

      const res = await axios.get(
        'http://localhost:8080/users/me',
        { 
          withCredentials: true,
        }
      );
      
      console.log("사용자 정보:", res.data);
      setUser(res.data);
      setName(res.data.name);
      setEmail(res.data.email);
      setPhone(res.data.phone || '');
      if (res.data.createdAt) {
        setCreatedAt(res.data.createdAt);
      } else {
        setCreatedAt(null);
      }
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err);
      console.error("에러 응답:", err.response);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else {
        alert('내 정보 조회 실패: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false); 
    }
  };

  const handleSaveProfile = async () => {
    console.log('SAVE START', { isLoading, user });
    setIsLoading(true);
    console.log('AFTER setIsLoading(true)', { isLoading: true });
    const previous = { ...user };
    const optimistic = { ...user, name, email, phone };
    setUser(optimistic);
    
    try {
      // JWT 토큰 확인 - localStorage에서 가져오기
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("JWT 토큰이 없습니다.");
      }

      console.log('ABOUT TO CALL API');
      const res = await axios.put(
        'http://localhost:8080/users/me',
        {name, email, phone },
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      await handleUserInfo();
      alert('프로필이 성공적으로 수정되었습니다.')
    } catch (err) {
      console.error("프로필 수정 실패:", err);
      setUser(previous);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else {
        alert('프로필 수정에 실패했습니다: ' + (err.response?.data?.message || err.message))
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleprofiledelete = async () => {
    try {
      console.log('ABOUT TO CALL API');
      const res = await axios.delete(
        `http://localhost:8080/users/me`,
        { withCredentials: true }
      )
      console.log('API RESPONSE', res.data);
      await logout();
      // 3) React 상태 동기화
      //   // App 수준에서 관리 중인 상태라면
      alert('프로필이 성공적으로 삭제되었습니다.')
      navigate('/');
    } catch (err) {
      alert('프로필 삭제에 실패했습니다: ' + err.response?.data?.message || err.message)
    }
  };


  const handleChangePasswordSubmit  = async () => {
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("JWT 토큰이 없습니다.");
        return;
      }
      const res = await axios.put(
        'http://localhost:8080/users/me/password',
        { currentPassword, newPassword },
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("비밀번호 변경 실패:", err);
      alert('비밀번호 변경에 실패했습니다: ' + (err.response?.data?.message || err.message));
    }
  };

  // 내가 쓴 글 삭제 함수
  const handleDeletePost = async (postId) => {
    if (!window.confirm('정말로 이 글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("JWT 토큰이 없습니다.");
        return;
      }

      const response = await axios.delete(`http://localhost:8083/goods-posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        alert('글이 성공적으로 삭제되었습니다.');
        // 글 목록에서 삭제된 글 제거
        setMyPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error("글 삭제 오류:", error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 굿즈 삭제 함수
  const handleDeleteGoods = async (goodsId) => {
    if (!window.confirm('정말로 이 굿즈를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("JWT 토큰이 없습니다.");
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        alert("유저 정보를 확인할 수 없습니다.");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/user-goods/${goodsId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        alert('굿즈가 성공적으로 삭제되었습니다.');
        // 굿즈 목록에서 삭제된 굿즈 제거
        setMyGoods(prevGoods => prevGoods.filter(goods => goods.id !== goodsId));
      } else {
        const errorData = await response.json();
        alert('삭제 실패: ' + (errorData.message || '알 수 없는 오류가 발생했습니다.'));
      }
    } catch (error) {
      console.error("굿즈 삭제 오류:", error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // AI 이미지 삭제 함수
  const handleDeleteAiImage = async (imageId) => {
    if (!window.confirm('정말로 이 AI 캐릭터를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("JWT 토큰이 없습니다.");
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        alert("유저 정보를 확인할 수 없습니다.");
        return;
      }
      console.log("AI 이미지 삭제:", { imageId, userId });

      // 방법 1: 쿼리 파라미터로 userId 전송
      const res = await fetch(`http://localhost:8080/api/ai-images/${imageId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        alert('AI 캐릭터가 성공적으로 삭제되었습니다.');
        // 이미지 목록에서 삭제된 이미지 제거
        setAiImages(prevImages => prevImages.filter(img => img.id !== imageId));
      } else {
        // 방법 2: 요청 본문에 userId 포함하여 재시도
        const res2 = await fetch(`http://localhost:8080/api/ai-images/${imageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });

        if (res2.ok) {
          alert('AI 캐릭터가 성공적으로 삭제되었습니다.');
          setAiImages(prevImages => prevImages.filter(img => img.id !== imageId));
        } else {
          const errorData = await res2.json();
          alert('삭제 실패: ' + (errorData.message || '알 수 없는 오류가 발생했습니다.'));
        }
      }
    } catch (error) {
      console.error("AI 이미지 삭제 오류:", error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (activeTab === 'ai' && user) {
      const fetchImages = async () => {
        try {
          // JWT 토큰 확인 - localStorage에서 가져오기
          const accessToken = localStorage.getItem("accessToken");
          if (!accessToken) {
            console.log("JWT 토큰이 없습니다. AI 이미지를 불러올 수 없습니다.");
            return;
          }

          const userId = getUserIdFromToken();
          if (!userId) {
            console.log("유저 정보를 확인할 수 없습니다.");
            return;
          }
          console.log("AI 이미지 불러오기:", userId);
          
          const res = await fetch(`http://localhost:8080/api/ai-images/user/${userId}`, {
            headers: { 
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            console.log("AI 이미지 데이터:", data);
            setAiImages(data);
          } else {
            console.error("AI 이미지 불러오기 실패:", res.status);
            if (res.status === 401) {
              console.log("인증 실패 - 로그인 페이지로 이동");
              navigate('/login');
            }
          }
        } catch (error) {
          console.error("AI 이미지 불러오기 오류:", error);
        }
      };
      fetchImages();
    }
  }, [activeTab, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchGoods();
    }
  }, [user]);


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중…</div>;
  }

  // user가 null이면 로딩 상태 유지
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">사용자 정보를 불러오는 중…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <img 
                    src={user?.profileImageUrl || '👤'}
                    alt="프로필" 
                    onError={e => e.currentTarget.style.display = 'none'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-300">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">{user?.name || '사용자'}</h2>
                <p className="text-sm text-gray-600 mb-2">{user?.email || '이메일 없음'}</p>
                <p className="text-xs text-gray-500">가입일: {user?.createdAt ? new Date(user.createdAt).toLocaleString() : '정보 없음'}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{orderStats.totalOrders}</div>
                  <div className="text-xs text-gray-600">총 주문</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {orderStats.totalSpent.toLocaleString()}원
                  </div>
                  <div className="text-xs text-gray-600">총 결제</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <button className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                onClick={async() => {
                  try {
                      await logout();             // 서버 로그아웃 요청 + 쿠키 삭제
                    } finally {
                      navigate('/login');         // 에러와 관계없이 리다이렉트
                    }
                }}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">로그아웃</span>
              </button>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">프로필 정보</h2>
                    <button
                      onClick={async() => {
                        console.log('CLICK start', { isEditing, isLoading });
                        if (isEditing) {
                          await handleSaveProfile();
                          console.log('AFTER SAVE', { isLoading, isEditing });
                          setIsEditing(false);
                        }
                        else{
                          setIsEditing(true);
                          console.log('EDIT MODE ON', { isEditing: true });
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{isEditing ? '저장' : '수정'}</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                        <input
                          type="text"
                          value={name}
                          disabled={!isEditing}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <input
                          type="email"
                          value={email}
                          disabled={!isEditing}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                        <input
                          type="tel"
                          value={phone}
                          disabled={!isEditing}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">가입일</label>
                        <input
                          type="text"
                          value={createdAt}
                          disabled
                          onChange={e => setCreatedAt(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">주문내역</h2>
                  {ordersLoading ? (
                    <div className="text-center py-12">로딩 중...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 mb-4">주문 내역이 없습니다.</div>
                      <Link 
                        to="/goods-maker" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        굿즈 제작하기
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        return (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-800">주문번호: ORD00{order.id}</h3>
                                <p className="text-sm text-gray-600">
                                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '날짜 없음'}
                                </p>
                              </div>
                              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                <StatusIcon className="w-4 h-4" />
                                <span>{getStatusText(order.status)}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span className="text-gray-700">
                                  {getGoodsDisplayName(order.goodsName)} (수량: {order.quantity}개)
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">총 결제금액</span>
                                <span className="font-semibold text-gray-800">
                                  {(order.price)?.toLocaleString() ?? '0'}원
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Favorites Tab - 내 굿즈 */}
              {activeTab === 'favorites' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">내 굿즈</h2>
                  {myGoods.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 mb-4">저장된 굿즈가 없습니다.</div>
                      <Link 
                        to="/goods-maker" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        굿즈 제작하기
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myGoods.map((goods) => (
                        <div key={goods.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                          <img 
                            src={goods.imageUrl} 
                            alt={goodsNames[goods.goodsType] || goods.goodsType} 
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              console.error("이미지 로드 실패:", goods.imageUrl);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div 
                            className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
                            style={{ display: 'none' }}
                          >
                            이미지를 불러올 수 없습니다
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">
                              {goodsNames[goods.goodsType] || goods.goodsType}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-blue-600">
                                {goodsPrices[goods.goodsType]?.toLocaleString() || '0'}원
                              </span>
                              <button 
                                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteGoods(goods.id)}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-sm">삭제</span>
                              </button>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {goods.createdAt ? new Date(goods.createdAt).toLocaleDateString('ko-KR') : '날짜 정보 없음'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AI 캐릭터 Tab */}
              {activeTab === 'ai' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">내 AI 캐릭터</h2>
                  {aiImages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 mb-4">저장된 AI 캐릭터 이미지가 없습니다.</div>
                      <Link 
                        to="/character-maker" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        AI 캐릭터 만들기
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {aiImages.map(img => (
                        <div key={img.id} className="relative group">
                          <div className="relative overflow-hidden rounded-xl shadow-lg">
                            <img 
                              src={img.imageUrl} 
                              alt="AI 캐릭터" 
                              className="w-full h-48 object-cover transition-transform group-hover:scale-105" 
                            />
                            {/* 삭제 버튼 오버레이 */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                              <button
                                onClick={() => handleDeleteAiImage(img.id)}
                                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200 transform scale-90 group-hover:scale-100"
                                title="삭제"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <span className="text-xs text-gray-500">
                              {new Date(img.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 내가 쓴 글 Tab */}
              {activeTab === 'posts' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">내가 쓴 글</h2>
                  {postsLoading ? (
                    <div className="text-center py-12">로딩 중...</div>
                  ) : myPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 mb-4">작성한 글이 없습니다.</div>
                      <Link 
                        to="/community" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        커뮤니티 가기
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myPosts.map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {post.content && post.content.length > 50 
                                  ? post.content.substring(0, 50) + '...' 
                                  : post.content}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => navigate(`/community/post/${post.id}`)}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                              >
                                보기
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
                              <span>댓글: {post.commentCount || 0}</span>
                              <span>좋아요: {post.likeCount || 0}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {post.status === 'PRIVATE' ? '나만보기' : '전체보기'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">설정</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">알림 설정</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">이메일 알림</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">SMS 알림</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">개인정보</h3>
                      <div className="space-y-3">
                        <button 
                          className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                          onClick={() => setShowPasswordForm(true)}  
                        >
                          <div className="font-medium text-gray-800">비밀번호 변경</div>
                          <div className="text-sm text-gray-600">계정 보안을 위해 주기적으로 변경하세요</div>
                        </button>
                        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                          <div className="font-medium text-gray-800">개인정보처리방침</div>
                          <div className="text-sm text-gray-600">개인정보 수집 및 이용에 대한 안내</div>
                        </button>
                        <button
                          className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                          onClick={handleprofiledelete}
                          >
                          <div className="font-medium text-gray-800">회원가입 탈퇴</div>
                          <div className="text-sm text-gray-600">회원탈퇴 시 모든 정보가 사라집니다.</div>
                        </button>
                      </div>
                    </div>
                  </div>
                  {showPasswordForm && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center p-6">
                      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">비밀번호 변경</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">현재 비밀번호</label>
                            <input
                              type="password"
                              value={currentPassword}
                              onChange={e => setCurrentPassword(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">새 비밀번호</label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                            onClick={() => setShowPasswordForm(false)}
                          >
                            취소
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            onClick={handleChangePasswordSubmit}
                          >
                            변경
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage; 