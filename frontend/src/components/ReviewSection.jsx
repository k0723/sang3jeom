import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';

const ReviewCard = ({ review }) => (
    <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                        <Star 
                            key={i} 
                            size={20} 
                            className={i < review.rating ? 'fill-current' : ''} 
                        />
                    ))}
                </div>
                <span className="ml-3 text-lg font-semibold text-yellow-600">
                    {review.rating}
                </span>
            </div>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                사용자 {review.userId}
            </span>
        </div>
        
        {review.imageUrl && (
            <div className="mb-4">
                <img 
                    src={review.imageUrl} 
                    alt="리뷰 이미지" 
                    className="w-full h-64 object-cover rounded-lg" 
                />
            </div>
        )}
        
        <p className="text-gray-800 text-base leading-relaxed">
            {review.content}
        </p>
        
        {review.createdAt && (
            <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            </div>
        )}
    </div>
);

export default function ReviewSection() {
    const [reviews, setReviews] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // 최초 2개 리뷰 로드
    useEffect(() => {
        fetchReviews(0, 2, true);
    }, []);

    const fetchReviews = async (pageNum, size, isFirstLoad = false) => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await axios.get(`/api/reviews?page=${pageNum}&size=${size}`);
            const data = response.data;
            const newReviews = data?.content || [];

            if (isFirstLoad) {
                setReviews(newReviews);
            } else {
                setReviews(prev => [...prev, ...newReviews]);
            }

            setHasMore(data && !data.last);

        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = Math.floor(reviews.length / 2);
        fetchReviews(nextPage, 2, false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8" data-aos="fade-up">
            <h2 className="text-xl font-bold text-gray-800 mb-6">고객 후기</h2>

            <div className="space-y-6">
                {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>

            {loading && <p className="text-center text-gray-500 mt-4">로딩 중...</p>}

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
        </div>
    );
}