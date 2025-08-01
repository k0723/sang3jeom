import React, { useState, useEffect } from 'react';
import { reviewAPIService } from '../utils/reviewAPI';
import { Star } from 'lucide-react';

const ReviewCard = ({ review }) => (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
                <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < review.rating ? 'fill-current' : ''} />
                    ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                    {review.rating}/5
                </span>
            </div>
            <span className="text-sm text-gray-500">
                {review.userName || `사용자${review.userId}` || '익명'}
            </span>
        </div>
        
        {/* 리뷰 이미지들 */}
        {review.imageUrls && review.imageUrls.length > 0 && (
            <div className="mb-3">
                <div className="grid grid-cols-2 gap-2">
                    {review.imageUrls.slice(0, 4).map((imageUrl, index) => (
                        <img 
                            key={index}
                            src={imageUrl} 
                            alt={`리뷰 이미지 ${index + 1}`} 
                            className="w-full h-24 object-cover rounded-md"
                            onClick={() => window.open(imageUrl, '_blank')}
                        />
                    ))}
                    {review.imageUrls.length > 4 && (
                        <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-500">
                            +{review.imageUrls.length - 4}
                        </div>
                    )}
                </div>
            </div>
        )}
        
        <p className="text-gray-700 text-sm leading-relaxed mb-2">
            {review.content}
        </p>
        
        <div className="text-xs text-gray-400">
            {new Date(review.createdAt).toLocaleDateString()}
        </div>
    </div>
);

export default function ReviewSection({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [totalReviews, setTotalReviews] = useState(0);
    const [averageRating, setAverageRating] = useState(0);

    // 최초 리뷰 로드
    useEffect(() => {
        fetchReviews(0, 4, true);
    }, [productId]);

    const fetchReviews = async (pageNum, size, isInitial = false) => {
        if (loading) return;
        setLoading(true);
        
        try {
            console.log('리뷰 로딩 시작:', { pageNum, size, productId });
            console.log('현재 baseURL:', reviewAPIService);
            
            // 전체 리뷰 조회 (productId가 없을 때)
            const response = await reviewAPIService.getReviews({
                page: pageNum,
                size: size,
                sortBy: 'createdAt',
                sortDir: 'desc'
                // productId는 전달하지 않음 - 전체 리뷰 조회이므로
            });

            console.log('리뷰 API 응답:', response);

            if (response && response.content) {
                if (isInitial) {
                    setReviews(response.content);
                    setTotalReviews(response.totalElements || 0);
                    // averageRating은 백엔드에서 제공하지 않으므로 클라이언트에서 계산
                    const avgRating = response.content.length > 0 
                        ? response.content.reduce((sum, review) => sum + review.rating, 0) / response.content.length 
                        : 0;
                    setAverageRating(avgRating);
                } else {
                    setReviews(prev => [...prev, ...response.content]);
                }
                
                setHasMore(!response.last);
                setPage(pageNum + 1);
            } else {
                // 응답이 빈 배열인 경우도 처리
                console.log('응답 데이터가 없습니다');
                if (isInitial) {
                    setReviews([]);
                    setTotalReviews(0);
                    setAverageRating(0);
                }
                setHasMore(false);
            }
        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
            console.error("에러 상세:", {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                config: error.config
            });
            
            // 서버 에러 시 임시 Mock 데이터 표시 (개발용)
            if (isInitial && process.env.NODE_ENV === 'development') {
                console.log('임시 Mock 데이터 사용');
                const mockReviews = [
                    {
                        id: 1,
                        userName: "김민수",
                        rating: 5,
                        content: "정말 만족스러운 상품이에요! 품질도 좋고 배송도 빨라서 감사합니다.",
                        imageUrls: [],
                        createdAt: "2025-07-30T10:30:00"
                    },
                    {
                        id: 2,
                        userName: "이영희",
                        rating: 4,
                        content: "전체적으로 만족합니다. 가격 대비 품질이 좋네요.",
                        imageUrls: [],
                        createdAt: "2025-07-29T15:20:00"
                    },
                    {
                        id: 3,
                        userName: "박철수",
                        rating: 5,
                        content: "배송도 빠르고 제품도 기대 이상입니다. 추천해요!",
                        imageUrls: [],
                        createdAt: "2025-07-28T09:15:00"
                    },
                    {
                        id: 4,
                        userName: "최수진",
                        rating: 4,
                        content: "좋은 상품입니다. 다음에도 주문할게요.",
                        imageUrls: [],
                        createdAt: "2025-07-27T14:45:00"
                    }
                ];
                
                setReviews(mockReviews);
                setTotalReviews(mockReviews.length);
                setAverageRating(4.5);
                setHasMore(false);
            } else {
                // 에러 시 빈 상태로 설정
                if (isInitial) {
                    setReviews([]);
                    setTotalReviews(0);
                    setAverageRating(0);
                }
                setHasMore(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        fetchReviews(page, 4);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8" data-aos="fade-up">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">고객 후기</h2>
                {totalReviews > 0 && (
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="ml-1 font-semibold text-gray-800">
                                {averageRating.toFixed(1)}
                            </span>
                        </div>
                        <span className="text-gray-500">
                            ({totalReviews}개 리뷰)
                        </span>
                    </div>
                )}
            </div>

            {reviews.length === 0 && !loading ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-2">아직 리뷰가 없습니다.</div>
                    <div className="text-sm text-gray-400">첫 번째 리뷰를 작성해보세요!</div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>

                    {loading && (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500 mt-2">로딩 중...</p>
                        </div>
                    )}

                    {hasMore && !loading && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleLoadMore}
                                className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
                            >
                                더보기
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}