import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLogout } from '../utils/useLogout';
import { getUserIdFromToken } from '../utils/jwtUtils';
import { reviewAPIService } from '../utils/reviewAPI';
import { createApiInstance } from '../utils/axiosInstance';
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
import { useAuth } from "../utils/useAuth";

const userServiceApi = createApiInstance('http://localhost:8080');
const orderServiceApi = createApiInstance('http://localhost:8082');
const communityServiceApi = createApiInstance('http://localhost:8083');
const imageServiceApi = createApiInstance('http://localhost:8000');

const MyPage = () => {

  const { setIsLoggedIn } = useAuth();
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
  const [editingReview, setEditingReview] = useState(null); // 수정할 리뷰 정보

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
      const response = await orderServiceApi.get('/orders/my-stats');
      
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

      const response = await communityServiceApi.get('/goods-posts/my-posts');
      
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
      console.log("🔄 fetchMyReviews 시작");
      
      // 먼저 주문 정보를 포함한 리뷰 API 시도
      try {
        const reviewsWithOrderInfo = await reviewAPIService.getMyReviewsWithOrderInfo();
        console.log("✅ 주문 정보 포함 리뷰 API 성공:", reviewsWithOrderInfo);
        setMyReviews(reviewsWithOrderInfo);
        return;
      } catch (apiError) {
        console.log("⚠️ 주문 정보 포함 API 실패, 수동 매칭 시도:", apiError.message);
      }
      
      // 백엔드 API가 없는 경우 수동으로 매칭
      console.log("🔄 기본 리뷰 API 호출 중...");
      const reviews = await reviewAPIService.getMyReviews();
      console.log("📝 내 리뷰 원본 데이터:", reviews);
      console.log("📊 리뷰 개수:", reviews?.length || 0);
      
      if (!reviews || reviews.length === 0) {
        console.log("ℹ️ 리뷰가 없습니다.");
        setMyReviews([]);
        return;
      }
      
      // 각 리뷰의 orderId 확인
      reviews.forEach((review, index) => {
        console.log(`🔍 리뷰 ${index + 1}:`, {
          id: review.id,
          orderId: review.orderId,
          orderIdType: typeof review.orderId,
          content: review.content?.substring(0, 30) + '...',
          rating: review.rating,
          imageUrls: review.imageUrls?.length || 0
        });
      });
      
      // 주문 정보와 매칭하기 위해 주문 내역 가져오기
      const token = localStorage.getItem("accessToken");
      console.log("🔑 액세스 토큰 존재:", !!token);
      
      if (token) {
        try {
          console.log("🔄 주문 내역 API 호출 중...");
          const ordersResponse = await orderServiceApi.get('/orders/my-orders');
          
          console.log("📦 주문 내역 원본 데이터:", ordersResponse.data);
          console.log("📊 주문 개수:", ordersResponse.data?.length || 0);
          
          if (!ordersResponse.data || ordersResponse.data.length === 0) {
            console.log("ℹ️ 주문 내역이 없습니다.");
            setMyReviews(reviews);
            return;
          }
          
          const ordersMap = {};
          ordersResponse.data.forEach(order => {
            // 다양한 타입으로 매핑
            ordersMap[order.id] = order;
            ordersMap[String(order.id)] = order;
            ordersMap[Number(order.id)] = order;
            
            console.log(`🗺️ 주문 매핑: ${order.id} (타입: ${typeof order.id}) →`, {
              goodsName: order.goodsName,
              orderDate: order.orderDate,
              status: order.status,
              price: order.price
            });
          });
          
          console.log("🗺️ 최종 주문 매핑 객체 키들:", Object.keys(ordersMap));
          
          // 리뷰에 주문 정보 추가
          const reviewsWithOrderInfo = reviews.map(review => {
            const orderId = review.orderId;
            const orderInfo = ordersMap[orderId] || ordersMap[String(orderId)] || ordersMap[Number(orderId)];
            
            console.log(`🔗 매칭 시도: 리뷰 ID ${review.id} (orderId: ${orderId}, 타입: ${typeof orderId}) →`, {
              found: !!orderInfo,
              orderInfo: orderInfo ? {
                id: orderInfo.id,
                goodsName: orderInfo.goodsName,
                status: orderInfo.status
              } : null
            });
            
            return {
              ...review,
              orderInfo: orderInfo
            };
          });
          
          console.log("✅ 주문 정보가 추가된 최종 리뷰:", reviewsWithOrderInfo);
          setMyReviews(reviewsWithOrderInfo);
        } catch (orderError) {
          console.error("❌ 주문 정보 가져오기 실패:", orderError);
          console.error("❌ 주문 API 에러 상세:", {
            status: orderError.response?.status,
            statusText: orderError.response?.statusText,
            data: orderError.response?.data,
            message: orderError.message
          });
          // 주문 정보 없이라도 리뷰는 표시
          setMyReviews(reviews);
        }
      } else {
        console.warn("⚠️ 토큰이 없어서 주문 정보를 가져올 수 없습니다.");
        setMyReviews(reviews);
      }
    } catch (error) {
      console.error("❌ 내 리뷰 불러오기 실패:", error);
      console.error("❌ 리뷰 API 에러 상세:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        console.log("🔐 인증 실패 - 로그인 페이지로 이동");
        navigate('/login');
      }
    } finally {
      setReviewsLoading(false);
      console.log("✅ fetchMyReviews 완료");
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
      const res = await imageServiceApi.get(`/api/user-goods?userId=${userId}`);
      
      console.log("굿즈 조회 API 응답 상태:", res.status);
      
      if (res.status === 200) {
        const data = res.data;
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
      console.log("🔄 fetchOrders 시작");
      
      const token = localStorage.getItem("accessToken");
      console.log("🔑 액세스 토큰 존재:", !!token);
      
      if (!token) {
        console.log("❌ JWT 토큰이 없습니다. 주문내역을 불러올 수 없습니다.");
        return;
      }

      console.log("🔄 주문내역 API 호출 중...");
      const response = await orderServiceApi.get('/orders/my-orders');
      
      console.log("📦 주문내역 API 응답:", response.data);
      console.log("📊 주문 개수:", response.data?.length || 0);
      setOrders(response.data);

      // 주문 ID들을 추출하여 리뷰 정보 batch 조회
      if (response.data && response.data.length > 0) {
        const orderIds = response.data.map(order => order.id);
        console.log("🔍 리뷰 조회할 주문 IDs:", orderIds);
        
        try {
          console.log("🔄 리뷰 batch 조회 중...");
          const reviewsData = await reviewAPIService.getReviewsByOrderIds(orderIds);
          console.log("📝 주문별 리뷰 정보 원본:", reviewsData);
          
          // 리뷰 데이터가 올바른 형태인지 확인하고 정리
          const cleanedReviewsData = {};
          if (reviewsData && typeof reviewsData === 'object') {
            Object.keys(reviewsData).forEach(orderId => {
              const review = reviewsData[orderId];
              // 리뷰가 실제로 존재하고 유효한 ID를 가지고 있는 경우만 추가
              if (review && review.id && review.id !== null && review.id !== undefined) {
                cleanedReviewsData[orderId] = review;
                console.log(`✅ 주문 ${orderId}에 대한 유효한 리뷰 발견:`, {
                  reviewId: review.id,
                  rating: review.rating,
                  content: review.content?.substring(0, 30) + '...'
                });
              } else {
                console.log(`❌ 주문 ${orderId}에 대한 리뷰 없음 또는 무효`);
              }
            });
          }
          
          console.log("📝 정리된 주문별 리뷰 정보:", cleanedReviewsData);
          
          // 기존 orderReviews와 새로 가져온 리뷰 정보를 병합 (기존 것 우선)
          setOrderReviews(prev => {
            const merged = { ...cleanedReviewsData, ...prev };
            console.log("🔄 기존 리뷰 상태 보존하며 병합:", {
              previous: prev,
              newData: cleanedReviewsData,
              merged: merged
            });
            return merged;
          });
        } catch (reviewError) {
          console.error("❌ 리뷰 정보 조회 실패:", reviewError);
          console.error("❌ 리뷰 API 에러 상세:", {
            status: reviewError.response?.status,
            statusText: reviewError.response?.statusText,
            data: reviewError.response?.data,
            message: reviewError.message
          });
          // 리뷰 조회 실패 시에도 기존 상태는 유지
        }
      } else {
        console.log("ℹ️ 주문내역이 없어서 리뷰 조회를 건너뜁니다.");
        // 주문이 없어도 기존 리뷰 상태는 유지
      }
    } catch (error) {
      console.error("❌ 주문내역 불러오기 실패:", error);
      console.error("❌ 주문 API 에러 상세:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        console.log("🔐 인증 실패 - 로그인 페이지로 이동");
        navigate('/login');
      }
    } finally {
      setOrdersLoading(false);
      console.log("✅ fetchOrders 완료");
    }
  };

  useEffect(() => {
    // 디버깅: 컴포넌트 마운트 시 상태 확인
    console.log("🔄 MyPage 컴포넌트 마운트");
    console.log("🔑 localStorage accessToken:", !!localStorage.getItem("accessToken"));
    console.log("🔑 Token 내용 (앞 20자):", localStorage.getItem("accessToken")?.substring(0, 20));
    
    handleUserInfo();
    fetchOrderStats(); // 주문 통계도 함께 가져오기
  }, []);

  // orderReviews 상태 변경 감지
  useEffect(() => {
    console.log('📊 orderReviews 상태 변경:', orderReviews);
    console.log('📊 orderReviews 키들:', Object.keys(orderReviews));
    // 디버깅용 전역 변수
    window.orderReviewsDebug = orderReviews;
  }, [orderReviews]);

  // orders 상태 변경 감지
  useEffect(() => {
    console.log('📦 orders 상태 변경:', orders);
    window.ordersDebug = orders;
  }, [orders]);

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
      // JWT 토큰 확인 - localStorage에서 가져오기

      const res = await userServiceApi.get('/users/me');
      
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
      const res = await userServiceApi.put('/users/me', {name, email, phone });
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
      const res = await userServiceApi.delete('/users/me')
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
      const res = await userServiceApi.put('/users/me/password', { currentPassword, newPassword });
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

      const response = await userServiceApi.delete(`/goods-posts/${postId}`);

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

  // 리뷰 쓰기 버튼 클릭
  const handleReviewWriteClick = (order) => {
    setSelectedOrder(order);
    setEditingReview(null); // 새 리뷰 작성
    setReviewModalOpen(true);
  };

  // 리뷰 수정 버튼 클릭
  const handleReviewEditClick = async (order) => {
    try {
      // 실제 리뷰 정보를 API에서 가져오기
      const reviewData = await reviewAPIService.getReviewByOrderId(order.id);
      console.log('가져온 리뷰 데이터:', reviewData);
      
      setSelectedOrder(order);
      setEditingReview(reviewData); // API에서 가져온 완전한 리뷰 정보 설정
      setReviewModalOpen(true);
    } catch (error) {
      console.error('리뷰 정보 가져오기 실패:', error);
      // API 호출 실패 시 기존 방식으로 폴백
      const existingReview = orderReviews[order.id];
      setSelectedOrder(order);
      setEditingReview(existingReview);
      setReviewModalOpen(true);
    }
  };

  // 리뷰 삭제 버튼 클릭
  const handleReviewDeleteClick = async (order) => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 먼저 실제 리뷰 정보를 가져와서 ID 확인
      let reviewToDelete = orderReviews[order.id];
      
      if (!reviewToDelete || !reviewToDelete.id) {
        console.log('리뷰 ID가 없어서 API에서 가져오는 중...');
        try {
          reviewToDelete = await reviewAPIService.getReviewByOrderId(order.id);
          console.log('API에서 가져온 리뷰:', reviewToDelete);
        } catch (fetchError) {
          console.error('리뷰 정보 가져오기 실패:', fetchError);
          alert('삭제할 리뷰 정보를 찾을 수 없습니다.');
          return;
        }
      }

      if (!reviewToDelete.id) {
        alert('리뷰 ID를 찾을 수 없습니다.');
        return;
      }

      console.log('삭제할 리뷰 ID:', reviewToDelete.id);
      await reviewAPIService.deleteReview(reviewToDelete.id);
      alert('리뷰가 성공적으로 삭제되었습니다.');
      
      // 주문 리뷰 정보에서 완전히 삭제 (undefined가 아닌 삭제)
      setOrderReviews(prev => {
        const updated = { ...prev };
        delete updated[order.id];
        console.log('✅ orderReviews에서 주문', order.id, '삭제 완료:', updated);
        return updated;
      });
      
      // 주문 목록 새로고침하지 않음 - 상태 업데이트만으로 충분
      
    } catch (error) {
      console.error("리뷰 삭제 오류:", error);
      if (error.response?.status === 404) {
        alert('삭제할 리뷰를 찾을 수 없습니다.');
      } else if (error.response?.status === 403) {
        alert('리뷰를 삭제할 권한이 없습니다.');
      } else {
        alert('리뷰 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  // 리뷰 제출
  const handleReviewSubmit = async (reviewData) => {
    try {
      console.log('🔄 리뷰 제출 시작:', {
        orderId: selectedOrder.id,
        isEditing: !!editingReview,
        ...reviewData
      });
      
      let response;
      
      if (editingReview) {
        // 리뷰 수정
        response = await reviewAPIService.updateReview(editingReview.id, {
          content: reviewData.content,
          rating: reviewData.rating,
          imageUrls: reviewData.imageUrls || []
        });
        console.log('✅ 리뷰 수정 성공:', response);
        alert('리뷰가 수정되었습니다!');
      } else {
        // 새 리뷰 작성
        response = await reviewAPIService.createReview({
          orderId: selectedOrder.id,
          content: reviewData.content,
          rating: reviewData.rating,
          imageUrls: reviewData.imageUrls || []
        });
        console.log('✅ 리뷰 생성 성공 - 전체 응답:', response);
        console.log('✅ 응답 타입:', typeof response);
        console.log('✅ 응답 키들:', Object.keys(response || {}));
        console.log('✅ response.id:', response?.id);
        console.log('✅ response.reviewId:', response?.reviewId);
        console.log('✅ response.data:', response?.data);
        alert('리뷰가 작성되었습니다!');
      }
      
      // 리뷰 작성/수정 후 주문 리뷰 정보 업데이트 (유효한 리뷰 ID 확인)
      if (response && (response.id || response.reviewId || response.data?.id)) {
        const reviewId = response.id || response.reviewId || response.data?.id;
        const newReviewData = {
          id: reviewId,
          content: reviewData.content,
          rating: reviewData.rating,
          imageUrls: reviewData.imageUrls || [],
          createdAt: editingReview?.createdAt || response.createdAt || new Date().toISOString(),
          updatedAt: response.updatedAt || new Date().toISOString()
        };
        
        console.log('🔄 orderReviews 상태 업데이트:', {
          orderId: selectedOrder.id,
          reviewData: newReviewData
        });
        
        setOrderReviews(prev => {
          const updated = {
            ...prev,
            [selectedOrder.id]: newReviewData
          };
          console.log('✅ orderReviews 업데이트 완료:', updated);
          
          // 디버깅용: 전역 변수에도 저장
          window.orderReviewsAfterUpdate = updated;
          window.testOrderId = selectedOrder.id;
          
          return updated;
        });
      } else {
        console.warn('⚠️ 응답에서 리뷰 ID를 찾을 수 없습니다:', response);
        
        // ID가 없어도 강제로 상태 업데이트 (UI 개선용)
        const tempReviewData = {
          id: `temp_${Date.now()}`, // 임시 ID
          content: reviewData.content,
          rating: reviewData.rating,
          imageUrls: reviewData.imageUrls || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('⚠️ 임시 리뷰 데이터로 상태 업데이트:', tempReviewData);
        
        setOrderReviews(prev => {
          const updated = {
            ...prev,
            [selectedOrder.id]: tempReviewData
          };
          console.log('⚠️ 임시 데이터로 orderReviews 업데이트:', updated);
          return updated;
        });
      }
      
      setReviewModalOpen(false);
      setSelectedOrder(null);
      setEditingReview(null);
      
      // 자동 새로고침 제거 - 상태 업데이트만으로 충분
      // setTimeout(() => {
      //   console.log('🔄 주문 목록 새로고침 시작');
      //   fetchOrders();
      // }, 500);
      
      console.log('✅ 리뷰 제출 완료');
    } catch (error) {
      console.error('❌ 리뷰 작성/수정 실패:', error);
      if (error.response?.status === 400) {
        alert(editingReview ? '리뷰 수정에 실패했습니다.' : '이미 리뷰가 작성된 주문입니다.');
      } else if (error.response?.status === 404) {
        alert('주문 정보를 찾을 수 없습니다.');
      } else {
        alert(`리뷰 ${editingReview ? '수정' : '작성'}에 실패했습니다. 잠시 후 다시 시도해주세요.`);
      }
    }
  };

  // 리뷰 모달 닫기
  const handleReviewModalClose = () => {
    setReviewModalOpen(false);
    setSelectedOrder(null);
    setEditingReview(null);
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

      const response = await imageServiceApi.delete(`/api/user-goods/${goodsId}?userId=${userId}`);

      if (response.status === 200) {
        alert('굿즈가 성공적으로 삭제되었습니다.');
        // 굿즈 목록에서 삭제된 굿즈 제거
        setMyGoods(prevGoods => prevGoods.filter(goods => goods.id !== goodsId));
      } else {
        const errorData = response.data;
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
      const res = await imageServiceApi.delete(`/api/ai-images/${imageId}?userId=${userId}`);

      if (res.status === 200) {
        alert('AI 캐릭터가 성공적으로 삭제되었습니다.');
        // 이미지 목록에서 삭제된 이미지 제거
        setAiImages(prevImages => prevImages.filter(img => img.id !== imageId));
      } else {
        // 방법 2: 요청 본문에 userId 포함하여 재시도
        const res2 = await imageServiceApi.delete(`/api/ai-images/${imageId}`, {
          data: { userId }
        });

        if (res2.status === 200) {
          alert('AI 캐릭터가 성공적으로 삭제되었습니다.');
          setAiImages(prevImages => prevImages.filter(img => img.id !== imageId));
        } else {
          const errorData = res2.data;
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
          
          const res = await imageServiceApi.get(`/api/ai-images/user/${userId}`);
          
          if (res.status === 200) {
            const data = res.data;
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
                              <div className="flex flex-col items-end space-y-2">
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  <span>{getStatusText(order.status)}</span>
                                </div>
                                {/* 리뷰 상태에 따른 버튼 표시 */}
                                {order.status === 'COMPLETED' && (() => {
                                  const hasReview = orderReviews[order.id] && orderReviews[order.id].id;
                                  console.log(`🔍 주문 ${order.id} 리뷰 상태 체크:`, {
                                    orderReviews: orderReviews[order.id],
                                    hasReview,
                                    reviewId: orderReviews[order.id]?.id
                                  });
                                  
                                  return hasReview ? (
                                    // 실제로 리뷰가 존재하는 경우만 수정/삭제 버튼 표시
                                    <div className="flex flex-col space-y-2">
                                      <button
                                        onClick={() => handleReviewEditClick(order)}
                                        className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors duration-200"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>리뷰수정</span>
                                      </button>
                                      <button
                                        onClick={() => handleReviewDeleteClick(order)}
                                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium cursor-pointer hover:bg-red-200 transition-colors duration-200"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>리뷰삭제</span>
                                      </button>
                                    </div>
                                  ) : (
                                    // 리뷰가 없는 경우 리뷰작성 버튼만 표시
                                    <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium cursor-pointer hover:bg-orange-200 transition-colors duration-200"
                                      onClick={() => handleReviewWriteClick(order)}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                      <span>리뷰작성</span>
                                    </div>
                                  );
                                })()}
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
                        to="/community" 
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

                          {/* 주문 정보 */}
                          {review.orderInfo ? (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                              <div className="text-sm text-gray-600 mb-1">주문상품</div>
                              <div className="font-medium text-gray-800">
                                {getGoodsDisplayName(review.orderInfo.goodsName)}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                주문일: {new Date(review.orderInfo.orderDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                주문번호: ORD00{review.orderInfo.id}
                              </div>
                            </div>
                          ) : review.orderId ? (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                              <div className="text-sm text-gray-600 mb-1">주문 정보</div>
                              <div className="text-sm text-gray-500">
                                주문 ID: {review.orderId}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                상세 주문 정보를 불러오지 못했습니다.
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                              <div className="text-sm text-gray-500">
                                주문 정보를 찾을 수 없습니다.
                              </div>
                            </div>
                          )}

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
                                      // 이미지 확대 보기 모달 (추후 구현)
                                      window.open(imageUrl, '_blank');
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 리뷰 내용 */}
                          <div className="mb-4">
                            <p className="text-gray-800 leading-relaxed">
                              {review.content}
                            </p>
                          </div>

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
      
      {/* 리뷰 모달 */}
      <ReviewModal
        isOpen={reviewModalOpen}
        order={selectedOrder}
        existingReview={editingReview}
        onClose={handleReviewModalClose}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default MyPage; 