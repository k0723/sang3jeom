import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLogout } from '../utils/useLogout';
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
import { useNavigate } from 'react-router-dom';

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

  // 임시 사용자 데이터

  const orders = [
    {
      id: 'ORD001',
      date: '2024.01.20',
      status: '배송완료',
      items: ['AI 캐릭터 머그컵', 'AI 캐릭터 스티커'],
      total: 25000
    },
    {
      id: 'ORD002',
      date: '2024.01.18',
      status: '제작중',
      items: ['AI 캐릭터 티셔츠'],
      total: 15000
    },
    {
      id: 'ORD003',
      date: '2024.01.15',
      status: '배송중',
      items: ['AI 캐릭터 키링'],
      total: 8000
    }
  ];

  const favorites = [
    {
      id: 1,
      name: 'AI 캐릭터 머그컵',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
      price: 15000
    },
    {
      id: 2,
      name: 'AI 캐릭터 티셔츠',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
      price: 25000
    }
  ];

  const tabs = [
    { id: 'profile', name: '프로필', icon: User },
    { id: 'orders', name: '주문내역', icon: ShoppingBag },
    { id: 'ai', name: 'AI 캐릭터', icon: Star }, // AI 캐릭터 탭 추가
    { id: 'favorites', name: '찜한 상품', icon: Heart },
    { id: 'settings', name: '설정', icon: Settings }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case '배송완료': return 'text-green-600 bg-green-100';
      case '배송중': return 'text-blue-600 bg-blue-100';
      case '제작중': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case '배송완료': return CheckCircle;
      case '배송중': return Truck;
      case '제작중': return Package;
      default: return Package;
    }
  };

  useEffect(() => {
    handleUserInfo();
  }, [])
  const handleUserInfo = async () => {
      try {
        const res = await axios.get(
      'http://localhost:8080/users/me',
      { withCredentials: true }
    );
        console.log(res.data)
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
        console.error(err);
        alert('내 정보 조회 실패');
      }
      finally {
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
      console.log('ABOUT TO CALL API');
      const res = await axios.put(
      'http://localhost:8080/users/me',
      {name, email, phone },
      { withCredentials: true }
    );
      await handleUserInfo();
      alert('프로필이 성공적으로 수정되었습니다.')
    } catch (err) {
      console.error(err);
      setUser(previous);
      alert('프로필 수정에 실패했습니다: ' + err.response?.data?.message || err.message)
    }
    finally {
      setIsLoading(false);       // 저장 완료 시 로딩 해제
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
    try {
      console.log('ABOUT TO CALL API');
      const res = await axios.put(
        `http://localhost:8080/users/me/password`,
        {
          currentPassword,
          newPassword    
        },
        { withCredentials: true }
      )
      console.log('API RESPONSE', res.data);
      // await logout();
      // 3) React 상태 동기화
      //   // App 수준에서 관리 중인 상태라면
      alert('비밀번호가 성공적으로 변경되었습니다.')
      navigate('/');
    } catch (err) {
      alert('비밀번호 변경에 실패했습니다: ' + err.response?.data?.message || err.message)
    }
  };

  useEffect(() => {
    if (activeTab === 'ai' && user) {
      const fetchImages = async () => {
        const jwt = sessionStorage.getItem("jwt");
        const userId = user?.id || 1;
        const res = await fetch(`/api/ai-images/user/${userId}`, {
          headers: { "Authorization": `Bearer ${jwt}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAiImages(data);
        }
      };
      fetchImages();
    }
  }, [activeTab, user]);


  if (isLoading) {
  return <div className="min-h-screen flex items-center justify-center">로딩 중…</div>;
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
                    src={user.profileImageUrl  || '👤'}
                    alt="프로필" 
                    onError={e => e.currentTarget.style.display = 'none'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-300">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h2>
                <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                <p className="text-xs text-gray-500">가입일: {user.createdAt ? new Date(user.createdAt).toLocaleString() : '정보 없음'}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{user.totalOrders}</div>
                    {user.totalOrders ?? 0}
                  <div className="text-xs text-gray-600">총 주문</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600"></div>
                    {(user.totalSpent ?? 0).toLocaleString()}원
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
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-800">주문번호: {order.id}</h3>
                              <p className="text-sm text-gray-600">{order.date}</p>
                            </div>
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              <StatusIcon className="w-4 h-4" />
                              <span>{order.status}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span className="text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">총 결제금액</span>
                                {(order.total?.toLocaleString() ?? '0')}원
                              <span className="font-semibold text-gray-800"></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">찜한 상품</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-blue-600">{item.price.toLocaleString() ?? '0'}원</span>
                            <button className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                              <Heart className="w-5 h-5 fill-current" />
                              <span className="text-sm">찜해제</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI 캐릭터 Tab */}
              {activeTab === 'ai' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">내 AI 캐릭터</h2>
                  <div className="flex gap-6 flex-wrap">
                    {aiImages.length === 0 && <div className="text-gray-500">저장된 AI 캐릭터 이미지가 없습니다.</div>}
                    {aiImages.map(img => (
                      <div key={img.id} className="flex flex-col items-center">
                        <img src={img.imageUrl} alt="AI 캐릭터" className="w-32 h-32 object-cover rounded-xl shadow" />
                        <span className="text-xs text-gray-500 mt-2">{new Date(img.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
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