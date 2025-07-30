import axios from 'axios';

const REVIEW_SERVICE_URL = 'http://localhost:8084'; // Review 서비스 포트

// 기본 axios 인스턴스 생성
const reviewAPI = axios.create({
  baseURL: REVIEW_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 자동 추가
reviewAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Review 서비스는 X-User-ID 헤더를 기대하므로 임시로 토큰에서 추출
      // 실제로는 API Gateway에서 처리해야 함
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        config.headers['X-User-ID'] = payload.userId || payload.sub;
      } catch (error) {
        console.warn('JWT 파싱 실패:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
reviewAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 리뷰 API 함수들
export const reviewAPIService = {
  // 리뷰 목록 조회 (페이징)
  async getReviews(params = {}) {
    try {
      const { page = 0, size = 10, productId, sortBy = 'createdAt', sortDir = 'desc' } = params;
      
      let url = '/api/reviews';
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });
      
      if (productId) {
        queryParams.append('productId', productId.toString());
      }
      
      url += `?${queryParams.toString()}`;
      
      const response = await reviewAPI.get(url);
      return response.data;
    } catch (error) {
      console.error('리뷰 목록 조회 실패:', error);
      throw error;
    }
  },

  // 특정 상품의 리뷰 조회
  async getProductReviews(productId, params = {}) {
    try {
      const { page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = params;
      
      const response = await reviewAPI.get(`/api/reviews/product/${productId}`, {
        params: { page, size, sortBy, sortDir }
      });
      return response.data;
    } catch (error) {
      console.error('상품 리뷰 조회 실패:', error);
      throw error;
    }
  },

  // 특정 주문의 리뷰 존재 여부 확인
  async hasReviewForOrder(orderId) {
    try {
      const response = await reviewAPI.get(`/api/reviews/order/${orderId}/exists`);
      return response.data;
    } catch (error) {
      console.error('리뷰 존재 여부 확인 실패:', error);
      return false;
    }
  },

  // 특정 주문의 리뷰 조회 (수정 모달용)
  async getReviewByOrderId(orderId) {
    try {
      const response = await reviewAPI.get(`/api/reviews/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('리뷰 조회 실패:', error);
      throw error;
    }
  },

  // 여러 주문의 리뷰 정보 batch 조회
  async getReviewsByOrderIds(orderIds) {
    try {
      const response = await reviewAPI.post('/api/reviews/orders/batch', {
        orderIds
      });
      return response.data;
    } catch (error) {
      console.error('Batch 리뷰 조회 실패:', error);
      return {};
    }
  },

  // 리뷰 작성
  async createReview(reviewData) {
    try {
      const response = await reviewAPI.post('/api/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      throw error;
    }
  },

  // 리뷰 수정
  async updateReview(reviewId, reviewData) {
    try {
      const response = await reviewAPI.put(`/api/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('리뷰 수정 실패:', error);
      throw error;
    }
  },

  // 리뷰 삭제
  async deleteReview(reviewId) {
    try {
      await reviewAPI.delete(`/api/reviews/${reviewId}`);
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      throw error;
    }
  },

  // 사용자의 모든 리뷰 조회 (마이페이지용)
  async getMyReviews() {
    try {
      const response = await reviewAPI.get('/api/reviews/my-reviews');
      return response.data;
    } catch (error) {
      console.error('내 리뷰 조회 실패:', error);
      throw error;
    }
  }
};

export default reviewAPIService;