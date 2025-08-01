import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLogout } from '../utils/useLogout';
import { getUserIdFromToken } from '../utils/jwtUtils';
import { reviewAPIService } from '../utils/reviewAPI';
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
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import ReviewModal from '../components/ReviewModal';

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
  const [orderReviews, setOrderReviews] = useState({}); // 주문별 리뷰 정보 저장
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  
  // 내 리뷰 관련 상태
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // 리뷰 모달 관련 state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingReview, setEditingReview] = useState(null); // 수정 중인 리뷰

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
    { id: 'reviews', name: '내 리뷰', icon: Star },
    { id: 'ai', name: 'AI 캐릭터', icon: Camera },
    { id: 'favorites', name: '내 굿즈', icon: Heart },
    { id: 'posts', name: '내가 쓴 글', icon: Edit },
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

  // 내 리뷰 가져오기
  const fetchMyReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviews = await reviewAPIService.getMyReviews();
      console.log("내 리뷰:", reviews);
      setMyReviews(reviews);
    } catch (error) {
      console.error("내 리뷰 불러오기 실패:", error);
      if (error.response?.status === 401) {
        console.log("인증 실패 - 로그인 페이지로 이동");
        navigate('/login');
      }
    } finally {
      setReviewsLoading(false);
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
        setMyGoods(data);
      } else {
        console.error("굿즈 불러오기 실패:", res.status);
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

      // 주문 ID들을 추출하여 리뷰 정보 batch 조회
      if (response.data && response.data.length > 0) {
        const orderIds = response.data.map(order => order.id);
        try {
          const reviewsData = await reviewAPIService.getReviewsByOrderIds(orderIds);
          console.log("주문별 리뷰 정보:", reviewsData);
          setOrderReviews(reviewsData);
        } catch (reviewError) {
          console.error("리뷰 정보 조회 실패:", reviewError);
          // 리뷰 조회 실패해도 주문내역은 표시
        }
      }
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
    fetchOrderStats();
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
    if (activeTab === 'reviews' && user) {
      fetchMyReviews();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'favorites' && user) {
      fetchGoods();
    }
  }, [activeTab, user]);

  const handleUserInfo = async () => {
    try {
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
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      }
    } finally {
      setIsLoading(false); 
    }
  };

  // 리뷰 쓰기 버튼 클릭
  const handleReviewWriteClick = (order) => {
    setEditingReview(null); // 새 리뷰 작성
    setSelectedOrder(order);
    setReviewModalOpen(true);
  };

  // 리뷰 수정 버튼 클릭
  const handleReviewEditClick = async (order) => {
    try {
      // 기존 리뷰 데이터 가져오기
      const existingReview = await reviewAPIService.getReviewByOrderId(order.id);
      setEditingReview(existingReview);
      setSelectedOrder(order);
      setReviewModalOpen(true);
    } catch (error) {
      console.error('리뷰 조회 실패:', error);
      alert('리뷰 정보를 불러올 수 없습니다.');
    }
  };

  // 리뷰 제출 (작성 또는 수정)
  const handleReviewSubmit = async (reviewData) => {
    try {
      let response;
      
      if (editingReview) {
        // 리뷰 수정
        response = await reviewAPIService.updateReview(editingReview.id, {
          content: reviewData.content,
          rating: reviewData.rating,
          imageUrls: reviewData.imageUrls || []
        });
        alert('리뷰가 수정되었습니다!');
      } else {
        // 리뷰 작성
        response = await reviewAPIService.createReview({
          orderId: selectedOrder.id,
          content: reviewData.content,
          rating: reviewData.rating,
          imageUrls: reviewData.imageUrls || []
        });
        alert('리뷰가 작성되었습니다!');
      }
      
      // 리뷰 정보 업데이트
      setOrderReviews(prev => ({
        ...prev,
        [selectedOrder.id]: {
          id: response.id,
          content: reviewData.content,
          rating: reviewData.rating,
          createdAt: editingReview ? editingReview.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
      
      setReviewModalOpen(false);
      setSelectedOrder(null);
      setEditingReview(null);
    } catch (error) {
      console.error('리뷰 처리 실패:', error);
      if (error.response?.status === 400) {
        alert(editingReview ? '리뷰 수정에 실패했습니다.' : '이미 리뷰가 작성된 주문입니다.');
      } else {
        alert('리뷰 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  // 리뷰 모달 닫기
  const handleReviewModalClose = () => {
    setReviewModalOpen(false);
    setSelectedOrder(null);
    setEditingReview(null); // 수정 상태 초기화
  };

  // 리뷰 삭제 함수
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await reviewAPIService.deleteReview(reviewId);
      alert('리뷰가 성공적으로 삭제되었습니다.');
      
      // 리뷰 목록에서 삭제된 리뷰 제거
      setMyReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
      
      // 주문 리뷰 정보에서도 제거
      const deletedReview = myReviews.find(review => review.id === reviewId);
      if (deletedReview && deletedReview.orderId) {
        setOrderReviews(prev => {
          const updated = { ...prev };
          delete updated[deletedReview.orderId];
          return updated;
        });
      }
    } catch (error) {
      console.error("리뷰 삭제 오류:", error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중…</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">사용자 정보를 불러오는 중…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
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
              <button 
                className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                onClick={async() => {
                  try {
                    await logout();
                  } finally {
                    navigate('/login');
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
                              <div className="flex flex-col items-end space-y-2">
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  <span>{getStatusText(order.status)}</span>
                                </div>
                                {/* 리뷰 상태에 따른 버튼 표시 */}
                                {order.status === 'COMPLETED' && (
                                  orderReviews[order.id] ? (
                                    // 이미 리뷰가 작성된 경우 - 수정 버튼
                                    <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors duration-200"
                                      onClick={() => handleReviewEditClick(order)}
                                    >
                                      <Edit className="w-4 h-4" />
                                      <span>리뷰수정</span>
                                    </div>
                                  ) : (
                                    // 리뷰가 아직 작성되지 않은 경우
                                    <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium cursor-pointer hover:bg-orange-200 transition-colors duration-200"
                                      onClick={() => handleReviewWriteClick(order)}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                      <span>리뷰작성</span>
                                    </div>
                                  )
                                )}
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

              {/* 내 리뷰 Tab */}
              {activeTab === 'reviews' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">내 리뷰</h2>
                  {reviewsLoading ? (
                    <div className="text-center py-12">로딩 중...</div>
                  ) : myReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 mb-4">작성한 리뷰가 없습니다.</div>
                      <Link 
                        to="/goods-maker" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        주문 후 리뷰 작성하기
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {myReviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          {/* 리뷰 헤더 */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-5 h-5 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm text-gray-600">
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                              >
                                삭제
                              </button>
                            </div>
                          </div>

                          {/* 리뷰 내용 */}
                          <div className="mb-4">
                            <p className="text-gray-800 leading-relaxed">
                              {review.content}
                            </p>
                          </div>

                          {/* 리뷰 이미지 */}
                          {review.imageUrls && review.imageUrls.length > 0 && (
                            <div className="mb-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {review.imageUrls.map((imageUrl, index) => (
                                  <img
                                    key={index}
                                    src={imageUrl}
                                    alt={`리뷰 이미지 ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                    onClick={() => {
                                      window.open(imageUrl, '_blank');
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 리뷰 메타 정보 */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                            <span>작성일: {new Date(review.createdAt).toLocaleDateString()}</span>
                            {review.updatedAt && review.updatedAt !== review.createdAt && (
                              <span>수정일: {new Date(review.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 다른 탭들도 여기에 추가... */}
              {/* 간단히 하기 위해 주요 탭들만 포함 */}
              
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* 리뷰 모달 */}
      <ReviewModal
        isOpen={reviewModalOpen}
        order={selectedOrder}
        existingReview={editingReview} // 기존 리뷰 데이터 전달
        onClose={handleReviewModalClose}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default MyPage;