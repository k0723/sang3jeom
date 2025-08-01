// JWT에서 userId 추출하는 공통 함수
export function getUserIdFromToken() {
  const accessToken = localStorage.getItem("accessToken");
  
  // 토큰이 없거나 빈 문자열인 경우
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
    console.log('JWT 토큰이 없습니다.');
    return null;
  }
  
  // 토큰 형식 검증
  if (!accessToken.includes('.')) {
    console.error('잘못된 JWT 형식:', accessToken);
    return null;
  }
  
  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      console.error('JWT 토큰이 3개 부분으로 구성되지 않음');
      return null;
    }
    
    const base64Payload = parts[1];
    const jsonPayload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    const decoded = JSON.parse(decodeURIComponent(
      jsonPayload
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    ));
    console.log('JWT 디코딩 결과:', decoded);
    
    // 백엔드 JWT 구조에 맞춰 userId 추출
    // uid: userId (Long), sub: userId (문자열)
    const userId = decoded?.uid || decoded?.sub;
    console.log('추출된 userId:', userId);
    
    // uid가 숫자인 경우 그대로 반환, sub가 문자열인 경우 숫자로 변환
    if (typeof userId === 'number') {
      return userId;
    } else if (typeof userId === 'string') {
      return parseInt(userId, 10);
    }
    
    return null;
  } catch (e) {
    console.error('JWT 파싱 오류:', e);
    console.error('토큰 값:', accessToken);
    return null;
  }
}

// JWT 토큰 유효성 검사
export function isTokenValid(token) {
  // 토큰이 없거나 빈 문자열인 경우
  if (!token || token === 'undefined' || token === 'null') {
    return false;
  }
  
  // 토큰 형식 검증
  if (!token.includes('.')) {
    return false;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    const base64Payload = parts[1];
    const jsonPayload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    const decoded = JSON.parse(decodeURIComponent(
      jsonPayload
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    ));
    
    // 토큰 만료 시간 확인
    const exp = decoded.exp;
    if (!exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return exp > now;
  } catch (e) {
    console.error('JWT 유효성 검사 오류:', e);
    return false;
  }
}

// localStorage에서 토큰을 가져와서 유효성 검사
export function isTokenValidFromStorage() {
  const accessToken = localStorage.getItem("accessToken");
  return isTokenValid(accessToken);
}

// 로그인 상태 확인
export function isLoggedIn() {
  return isTokenValidFromStorage() && getUserIdFromToken() !== null;
} 