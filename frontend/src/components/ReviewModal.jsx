import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Camera, Trash2 } from 'lucide-react';

const ReviewModal = ({ isOpen, order, existingReview, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [images, setImages] = useState([]);

  // 기존 리뷰 데이터로 초기화
  useEffect(() => {
    if (existingReview) {
      setContent(existingReview.content || '');
      setRating(existingReview.rating || 5);
      setImages(existingReview.imageUrls ? existingReview.imageUrls.map(url => ({ url })) : []);
    } else {
      // 새 리뷰 작성 시 초기화
      setContent('');
      setRating(5);
      setImages([]);
    }
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    
    if (content.trim().length < 10) {
      alert('리뷰는 최소 10자 이상 작성해주세요.');
      return;
    }
    
    // 업로딩 중인 이미지가 있는지 확인
    const uploadingImages = images.filter(img => img.uploading);
    if (uploadingImages.length > 0) {
      alert('이미지 업로드가 완료될 때까지 기다려주세요.');
      return;
    }
    
    // 이미지 URL만 추출
    const imageUrls = images.map(img => img.url).filter(url => url);
    
    onSubmit({
      content: content.trim(),
      rating,
      imageUrls
    });
    
    // 모달 초기화
    setContent('');
    setRating(5);
    setImages([]);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // 파일 개수 제한 체크
    if (images.length + files.length > 5) {
      alert('최대 5장까지만 업로드할 수 있습니다.');
      return;
    }
    
    // 파일 크기 체크 (10MB)
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }
    
    // 지원되는 파일 형식 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const unsupportedFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (unsupportedFiles.length > 0) {
      alert('JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.');
      return;
    }
    
    try {
      // 임시로 미리보기 이미지 추가
      const previewImages = files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        file: file,
        uploading: true
      }));
      
      setImages(prev => [...prev, ...previewImages]);
      
      // TODO: 실제 서버 업로드 구현
      // 현재는 임시로 클라이언트 사이드 URL 사용
      // 실제 구현 시에는 multipart/form-data로 서버에 업로드하고 
      // 서버에서 반환된 URL을 사용해야 함
      
      // 예시 서버 업로드 코드 (주석 처리)
      /*
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/upload/review-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('이미지 업로드 실패');
        }
        
        const data = await response.json();
        return data.imageUrl;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      */
      
      // 업로드 완료 처리 (현재는 임시 URL 사용)
      setTimeout(() => {
        setImages(prev => 
          prev.map(img => 
            previewImages.some(preview => preview.name === img.name) 
              ? { ...img, uploading: false } 
              : img
          )
        );
      }, 1000);
      
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      
      // 실패한 이미지들 제거
      const failedImageNames = files.map(f => f.name);
      setImages(prev => 
        prev.filter(img => !failedImageNames.includes(img.name))
      );
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getRatingText = (rating) => {
    const texts = {
      0.5: '최악',
      1: '매우 불만족',
      1.5: '불만족',
      2: '불만족',
      2.5: '보통 이하',
      3: '보통',
      3.5: '보통 이상',
      4: '만족',
      4.5: '매우 만족',
      5: '최고'
    };
    return texts[rating] || '보통';
  };

  // 별 클릭 핸들러 - 0.5 단위로 별점 설정
  const handleStarClick = (starIndex, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    const newRating = isLeftHalf ? starIndex - 0.5 : starIndex;
    setRating(newRating);
  };

  // 마우스 호버 핸들러 - 0.5 단위로 미리보기
  const handleStarHover = (starIndex, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    const newHoveredRating = isLeftHalf ? starIndex - 0.5 : starIndex;
    setHoveredRating(newHoveredRating);
  };

  // 별 렌더링 함수 - 반별 지원
  const renderStar = (starIndex) => {
    const currentRating = hoveredRating || rating;
    const isFull = starIndex <= currentRating;
    const isHalf = starIndex - 0.5 === currentRating;
    
    return (
      <div key={starIndex} className="relative">
        <button
          type="button"
          className="p-1 transition-transform hover:scale-110 text-gray-300"
          onClick={(e) => handleStarClick(starIndex, e)}
          onMouseMove={(e) => handleStarHover(starIndex, e)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star className="w-8 h-8" />
        </button>
        
        {/* 가득 찬 별 */}
        {isFull && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="p-1">
              <Star className="w-8 h-8 text-yellow-400 fill-current" />
            </div>
          </div>
        )}
        
        {/* 반별 */}
        {isHalf && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="p-1">
              <div className="relative w-8 h-8 overflow-hidden">
                <Star className="w-8 h-8 text-yellow-400 fill-current absolute left-0 top-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {existingReview ? '리뷰 수정' : '리뷰 작성'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Order Summary */}
            {order && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">주문 상품</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700">{order.goodsName}</p>
                    <p className="text-sm text-gray-500">
                      주문일: {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {order.price.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-500">수량: {order.quantity}개</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Section */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  평점
                </label>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map(starIndex => renderStar(starIndex))}
                  <span className="ml-3 text-lg font-medium text-gray-700">
                    {rating}/5점
                  </span>
                </div>
              </div>
              
              {/* Content Section */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  리뷰 내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="상품에 대한 솔직한 리뷰를 작성해주세요. 다른 구매자들에게 도움이 되는 정보를 공유해보세요!"
                  rows="6"
                  maxLength="500"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none text-gray-700 placeholder-gray-400"
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">
                    최소 10자 이상 작성해주세요.
                  </div>
                  <div className="text-sm text-gray-500">
                    {content.length}/500
                  </div>
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  사진 첨부 (선택사항)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-gray-600">사진을 선택하거나 여기에 드래그하세요</span>
                    <span className="text-sm text-gray-400 mt-1">
                      최대 5장까지 첨부 가능 (JPG, PNG, 최대 10MB)
                    </span>
                  </label>
                </div>
                
                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`리뷰 이미지 ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-lg border border-gray-200 ${
                            image.uploading ? 'opacity-50' : ''
                          }`}
                        />
                        {/* 업로딩 상태 표시 */}
                        {image.uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                          </div>
                        )}
                        {/* 삭제 버튼 */}
                        {!image.uploading && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || content.trim().length < 10}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {existingReview ? '리뷰 수정' : '리뷰 등록'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;