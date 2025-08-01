import axios from 'axios';

const REVIEW_SERVICE_URL = 'http://localhost:8084/api/reviews'; // 직접 백엔드 URL 사용

// 기본 axios 인스턴스 생성
const reviewAPI = axios.create({
  baseURL: REVIEW_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 이미지 관련 axios 인스턴스 생성
const imageAPI = axios.create({
  baseURL: '', // 프록시를 통해 접근
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 자동 추가 (reviewAPI)
reviewAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    // 전체 리뷰 조회는 토큰 없이도 가능
    const isPublicEndpoint = 
      config.method === 'get' && 
      (config.url === '' || config.url.startsWith('?'));
    
    if (token && !isPublicEndpoint) {
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
    
    console.log('리뷰 API 요청:', {
      method: config.method,
      url: config.url,
      hasToken: !!token,
      isPublic: isPublicEndpoint,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 요청 인터셉터 - JWT 토큰 자동 추가 (imageAPI)
imageAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

// 응답 인터셉터 - 에러 처리 (reviewAPI)
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

// 응답 인터셉터 - 에러 처리 (imageAPI)
imageAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const reviewAPIService = {
  // 리뷰 목록 조회 (페이징)
  async getReviews(params = {}) {
    try {
      const { page = 0, size = 10, productId, sortBy = 'createdAt', sortDir = 'desc' } = params;
      
      // axios params 객체를 사용하여 자동 인코딩 방지
      const requestParams = {
        page: page.toString(),
        size: size.toString(),
        sort: `${sortBy},${sortDir}`  // Spring Data Pageable 형식
      };
      
      if (productId) {
        requestParams.productId = productId.toString();
      }
      
      console.log('리뷰 API 요청 params:', requestParams);
      
      const response = await reviewAPI.get('', { params: requestParams });
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
      
      const response = await reviewAPI.get(`/product/${productId}`, {
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
      const response = await reviewAPI.get(`/order/${orderId}/exists`);
      return response.data;
    } catch (error) {
      console.error('리뷰 존재 여부 확인 실패:', error);
      return false;
    }
  },

  // 특정 주문의 리뷰 조회 (수정 모달용)
  async getReviewByOrderId(orderId) {
    try {
      const response = await reviewAPI.get(`/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('리뷰 조회 실패:', error);
      throw error;
    }
  },

  // 여러 주문의 리뷰 정보 batch 조회
  async getReviewsByOrderIds(orderIds) {
    try {
      const response = await reviewAPI.post('/orders/batch', {
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
      const response = await reviewAPI.post('', reviewData);
      return response.data;
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      throw error;
    }
  },

  // 리뷰 수정
  async updateReview(reviewId, reviewData) {
    try {
      const response = await reviewAPI.put(`/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('리뷰 수정 실패:', error);
      throw error;
    }
  },

  // 리뷰 삭제
  async deleteReview(reviewId) {
    try {
      await reviewAPI.delete(`/${reviewId}`);
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      throw error;
    }
  },

  // 사용자의 모든 리뷰 조회 (마이페이지용)
  async getMyReviews() {
    try {
      const response = await reviewAPI.get('/my-reviews');
      return response.data;
    } catch (error) {
      console.error('내 리뷰 조회 실패:', error);
      throw error;
    }
  },

  // 사용자의 모든 리뷰를 주문 정보와 함께 조회 (마이페이지용)
  async getMyReviewsWithOrderInfo() {
    try {
      const response = await reviewAPI.get('/my-reviews-with-order-info');
      return response.data;
    } catch (error) {
      console.error('주문 정보를 포함한 내 리뷰 조회 실패:', error);
      // 백엔드 API가 아직 구현되지 않은 경우를 대비해 기본 API로 폴백
      return this.getMyReviews();
    }
  }
};

// imageAPI도 별도로 export
export const imageAPIService = {
  // S3 프리사인드 URL 생성
  async getPresignedUrl(fileName, fileType) {
    try {
      const response = await imageAPI.post('/api/images/presigned-url', {
        filename: fileName,  // 백엔드에서 'filename'으로 받고 있음
        fileType
      });
      return response.data;
    } catch (error) {
      console.error('프리사인드 URL 생성 실패:', error);
      throw error;
    }
  },

  // S3에 이미지 직접 업로드
  async uploadImageToS3(presignedUrl, file) {
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });
      
      if (!response.ok) {
        throw new Error(`S3 업로드 실패: ${response.status}`);
      }
      
      // 업로드 성공 시 이미지 URL 반환 (프리사인드 URL에서 쿼리 파라미터 제거)
      return presignedUrl.split('?')[0];
    } catch (error) {
      console.error('S3 이미지 업로드 실패:', error);
      throw error;
    }
  },

  // 이미지 업로드 헬퍼 함수 (프리사인드 URL 생성 + S3 업로드)
  async uploadReviewImage(file) {
    try {
      // 1. 파일 이름 생성 (타임스탬프 + 랜덤값 + 원본파일명)
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `reviews/${timestamp}_${randomId}.${fileExtension}`;
      
      console.log('이미지 업로드 시작:', {
        originalName: file.name,
        fileName,
        fileType: file.type,
        fileSize: file.size
      });
      
      // 2. 프리사인드 URL 생성
      const presignedUrl = await this.getPresignedUrl(fileName, file.type);
      console.log('프리사인드 URL 생성 완료:', presignedUrl);
      
      // 3. S3에 업로드 (응답이 문자열인 경우 직접 사용)
      const uploadUrl = typeof presignedUrl === 'string' ? presignedUrl : presignedUrl.presignedUrl || presignedUrl.url;
      const imageUrl = await this.uploadImageToS3(uploadUrl, file);
      console.log('S3 업로드 완료:', imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('이미지 업로드 전체 프로세스 실패:', error);
      throw error;
    }
  }
};

export default reviewAPIService;