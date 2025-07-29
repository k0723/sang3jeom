import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';

const ReviewCard = ({ review }) => (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? 'fill-current' : ''} />
                ))}
            </div>
            <span className="ml-2 text-sm font-semibold text-gray-800">{review.userId}</span>
        </div>
        {review.imageUrl && (
            <img src={review.imageUrl} alt="리뷰 이미지" className="w-full h-48 object-cover rounded-md mb-3" />
        )}
        <p className="text-gray-700 text-sm">
            {review.content}
        </p>
    </div>
);

export default function ReviewSection() {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true); // 더 불러올 리뷰가 있는지 여부
    const [loading, setLoading] = useState(false);

    // 최초 1개 리뷰 로드
    useEffect(() => {
        fetchReviews(0, 1);
    }, []);

    const fetchReviews = async (pageNum, size) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axios.get(`/api/reviews?page=${pageNum}&size=${size}`);
            const data = response.data;

            const newReviews = data && Array.isArray(data.content) ? data.content : [];

            setReviews(prev => [...prev, ...newReviews]);

            setHasMore(data && data.last === false);

            setPage(pageNum + 1);

        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        // 다음 페이지에서 2개씩 불러오기
        fetchReviews(page, 2);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8" data-aos="fade-up">
            <h2 className="text-xl font-bold text-gray-800 mb-6">고객 후기</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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