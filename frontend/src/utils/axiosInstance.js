import axios from 'axios';

// 토큰 재발급 전용 axios 인스턴스 (항상 User Service로 요청)
const refreshApi = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

/**
 * MSA 환경에 맞춰, 각 서비스의 baseURL을 입력받아 axios 인스턴스를 생성합니다.
 * 이 인스턴스는 401 오류 발생 시 자동으로 토큰 재발급을 시도합니다.
 * 토큰 재발급 요청은 항상 User Service(8080)로 전송됩니다.
 * @param {string} baseURL - 요청을 보낼 서비스의 기본 URL
 */
export function createApiInstance(baseURL) {
  const api = axios.create({
    baseURL, // 각 서비스의 baseURL 사용
    withCredentials: true,
  });

  // 초기 Authorization 헤더 세팅
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // 요청 인터셉터: 모든 요청에 인증 토큰 추가
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터: 401 오류 시 토큰 재발급 처리
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // 401 에러이고, 재시도한 요청이 아닐 경우
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // 이미 토큰 재발급이 진행 중인 경우, 큐에 추가
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // User Service (8080) 로 토큰 재발급 요청
          const res = await refreshApi.post('/users/refresh');
          const newAccessToken = res.data.accessToken;

          localStorage.setItem('accessToken', newAccessToken);

          // 새로 발급받은 토큰으로 기본 헤더 설정
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          // 실패했던 원래 요청의 헤더도 변경
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          // 대기 중이던 모든 요청에 새 토큰으로 재시도
          processQueue(null, newAccessToken);

          // 원래 요청을 다시 실행
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          console.error("토큰 재발급 실패:", err);
          // 재발급 실패 시 로그인 페이지로 리디렉션 또는 다른 처리
          // 예: localStorage.clear(); window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}
