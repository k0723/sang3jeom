import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createApiInstance } from '../utils/axiosInstance';

const authApi = createApiInstance('http://localhost:8080');
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  UserPlus,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  //유효성 검사 로직 
  // 이메일 유효성 검사
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 비밀번호 유효성 검사 (8자 이상 + 영문자 + 숫자/특수문자 포함)
  const isValidPassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*[\d\W]).{8,}$/.test(password);

  // 전화번호 유효성 검사 (010-XXXX-XXXX)
  const isValidPhone = (phone) => /^010-\d{4}-\d{4}$/.test(phone);

  // 이름 유효성 검사 (2자 이상, 공백 제외)
const isValidName = (name) => name.trim().length >= 2;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgreementChange = (name) => {
    setAgreements(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSendVerificationCode = async () => {
    if (!isValidEmail(formData.email)) {
      setVerificationError('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    try {
      await authApi.post('/api/v1/email-verification/send', { email: formData.email });
      setIsVerificationCodeSent(true);
      setVerificationError('인증 코드가 발송되었습니다. 이메일을 확인해주세요.');
    } catch (error) {
      setVerificationError('인증 코드 발송에 실패했습니다.');
    }
  };

  const handleConfirmVerificationCode = async () => {
    try {
      await authApi.post('/api/v1/email-verification/confirm', { email: formData.email, code: emailVerificationCode });
      setIsEmailVerified(true);
      setVerificationError('이메일 인증이 완료되었습니다.');
    } catch (error) {
      setVerificationError('인증 코드가 올바르지 않습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid() || !isEmailVerified) {
    setError("입력값을 다시 확인해주세요. 이메일 인증이 필요합니다.");
    return;
    }
    setIsLoading(true);
    setError('');
    // TODO: 실제 회원가입 로직 구현
    try {
    // 1) POST 요청: /signup (회원가입)
    const response = await authApi.post(
      '/signup',      // 백엔드 URL을 실제 주소로 바꿔주세요
      {
        username:            formData.name,
        email:           formData.email,
        password:        formData.password,
        confirmPassword: formData.confirmPassword,
        phone:           formData.phone,
        agreements       // { terms, privacy, marketing }
      }
    );

    // 2) 성공 처리
    console.log('회원가입 성공:', response.data);
    // 예: JWT 저장 또는 리다이렉트
    window.location.href = '/';

  } catch (err) {
    // 3) 에러 처리
    console.error('회원가입 실패:', err);
    if (err.response) {
      // 서버가 응답을 반환했으나 상태 코드가 2xx 아닌 경우
      setError(err.response.data.message || '서버 오류가 발생했습니다.');
    } else {
      // 네트워크 오류 등
      setError('네트워크 오류가 발생했습니다.');
    }
  } finally {
    setIsLoading(false);
  }
  };

  const isFormValid = () => {
    return (
      isValidName(formData.name) &&
      isValidEmail(formData.email) &&
      isValidPassword(formData.password) &&
      formData.password === formData.confirmPassword &&
      isValidPhone(formData.phone) &&
      agreements.terms &&
      agreements.privacy &&
      isEmailVerified
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">홈으로 돌아가기</span>
              </Link>
              
              <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">상</span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">상상상점 회원가입</h2>
              <p className="text-gray-600">AI 굿즈 제작을 위한 계정을 만들어보세요</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white py-8 px-6 shadow-xl rounded-2xl"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* 이름 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="홍길동"
                  />
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    disabled={isVerificationCodeSent || isEmailVerified} // 인증 코드 발송 후 비활성화
                  />
                  {!isEmailVerified && ( // 인증 완료 전까지 버튼 표시
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={!isValidEmail(formData.email) || isVerificationCodeSent}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isVerificationCodeSent ? '재전송' : '인증 코드 받기'}
                    </button>
                  )}
                </div>
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="mt-1 text-xs text-red-500">올바른 이메일 주소를 입력하세요.</p>
                )}
                {isVerificationCodeSent && !isEmailVerified && (
                  <div className="mt-4">
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                      인증 코드
                    </label>
                    <div className="relative">
                      <input
                        id="verificationCode"
                        name="verificationCode"
                        type="text"
                        required
                        value={emailVerificationCode}
                        onChange={(e) => setEmailVerificationCode(e.target.value)}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="인증 코드 입력"
                        disabled={isEmailVerified}
                      />
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleConfirmVerificationCode}
                          disabled={!emailVerificationCode.trim()}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          확인
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {verificationError && (
                  <p className={`mt-1 text-xs ${isEmailVerified ? 'text-green-500' : 'text-red-500'}`}>
                    {verificationError}
                  </p>
                )}
              </div>

              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                  {formData.password && !isValidPassword(formData.password) && (
                  <p className="mt-1 text-xs text-red-500">올바른 비밀번호를 입력하세요.</p>
                  )}
                <p className="mt-1 text-xs text-gray-500">8자 이상, 영문/숫자/특수문자 조합</p>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다</p>
                )}
              </div>

              {/* 전화번호 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="010-1234-5678"
                />
                  {formData.phone && !isValidPhone(formData.phone) && (
                  <p className="mt-1 text-xs text-red-500">010-1234-1234 형식으로 입력하세요.</p>
                )}
              </div>

              {/* 약관 동의 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">약관 동의</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={agreements.terms}
                      onChange={() => handleAgreementChange('terms')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      <span className="font-medium">이용약관</span>에 동의합니다 (필수)
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="privacy"
                      name="privacy"
                      type="checkbox"
                      checked={agreements.privacy}
                      onChange={() => handleAgreementChange('privacy')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      required
                    />
                    <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                      <span className="font-medium">개인정보처리방침</span>에 동의합니다 (필수)
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="marketing"
                      name="marketing"
                      type="checkbox"
                      checked={agreements.marketing}
                      onChange={() => handleAgreementChange('marketing')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                      <span className="font-medium">마케팅 정보 수신</span>에 동의합니다 (선택)
                    </label>
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg transition-all duration-300 ${
                  isFormValid()
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
                disabled={isLoading || !isFormValid()}
                whileHover={isFormValid() ? { scale: 1.02 } : {}}
                whileTap={isFormValid() ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    회원가입
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  로그인하기
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 