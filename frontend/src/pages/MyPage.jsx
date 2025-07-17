import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

const MyPage = () => {
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [createdat, setCreatedAt] = useState('');

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

  function parseJwt(token) {
    try {
      const base64Payload = token.split('.')[1]; 
      const jsonPayload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(
        jsonPayload
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      ));
    } catch (e) {
      console.error('Invalid JWT:', e);
      return null;
    }
  }

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('jwt')
      const payload = parseJwt(token);
      const id = payload.id;
      const res = await axios.patch(
        `http://localhost:8080/users/${id}`,
        { name, email, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      setUser(res.data);

      setIsEditing(false)
      alert('프로필이 성공적으로 수정되었습니다.')
    } catch (err) {
      console.error(err)
      alert('프로필 수정에 실패했습니다: ' + err.response?.data?.message || err.message)
    }
  };

  useEffect(() => {
    const handleUserInfo = async () => {
      const token = localStorage.getItem('jwt')
      const payload = parseJwt(token);
      const id = payload.id;
      try {
        const res = await axios.get(`http://localhost:8080/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
        setPhone(res.data.phone || '');
        setCreatedAt(res.data.createdat);
      } catch (err) {
        console.error(err);
        alert('내 정보 조회 실패');
      }
    };
    handleUserInfo();
  }, []);
  if (!user) return <div>로딩 중...</div>;

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
                    src={user.avatar} 
                    alt="프로필" 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-300">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h2>
                <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                <p className="text-xs text-gray-500">가입일: {user.joinDate}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{user.totalOrders}</div>
                  <div className="text-xs text-gray-600">총 주문</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{user.totalSpent.toLocaleString()}원</div>
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
              <button className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300">
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
                      onClick={() => {
                        if (isEditing) {
                          handleSaveProfile();
                        }
                        setIsEditing(v => !v);
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
                          defaultValue={user.name}
                          disabled={!isEditing}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          disabled={!isEditing}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                        <input
                          type="tel"
                          defaultValue={user.phone}
                          disabled={!isEditing}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">가입일</label>
                        <input
                          type="text"
                          defaultValue={user.joinDate}
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
                              <span className="font-semibold text-gray-800">{order.total.toLocaleString()}원</span>
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
                            <span className="text-lg font-bold text-blue-600">{item.price.toLocaleString()}원</span>
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
                        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                          <div className="font-medium text-gray-800">비밀번호 변경</div>
                          <div className="text-sm text-gray-600">계정 보안을 위해 주기적으로 변경하세요</div>
                        </button>
                        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                          <div className="font-medium text-gray-800">개인정보처리방침</div>
                          <div className="text-sm text-gray-600">개인정보 수집 및 이용에 대한 안내</div>
                        </button>
                      </div>
                    </div>
                  </div>
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