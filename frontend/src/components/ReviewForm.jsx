import React, { useState } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';

// 별점 컴포넌트
const StarRating = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseMove = (starIndex, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const isHalf = (event.clientX - rect.left) < (rect.width / 2);
        setHoverRating(isHalf ? starIndex - 0.5 : starIndex);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleClick = () => {
        setRating(hoverRating);
    };

    return (
        <div className="flex" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((starIndex) => {
                const displayRating = hoverRating || rating;
                let fillPercentage = '0%';
                if (displayRating >= starIndex) {
                    fillPercentage = '100%';
                } else if (displayRating >= starIndex - 0.5) {
                    fillPercentage = '50%';
                }

                return (
                    <div
                        key={starIndex}
                        className="cursor-pointer"
                        onMouseMove={(e) => handleMouseMove(starIndex, e)}
                        onClick={handleClick}
                    >
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <Star color="#e4e5e9" fill="#e4e5e9" size={28} />
                            <div style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: fillPercentage }}>
                                <Star color="#ffc107" fill="#ffc107" size={28} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default function ReviewForm() {
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // 로딩 상태 추가

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("별점을 선택해주세요.");
            return;
        }

        setIsSubmitting(true); // 제출 시작 시 로딩 상태로 변경

        // --- 백엔드 연동 로직 ---
        try {
            // TODO: 실제 환경에서는 쿠키나 로컬 스토리지에서 JWT 토큰을 가져와야 합니다.
            const token = localStorage.getItem('accessToken');

            const response = await axios.post(
                '/api/reviews', // 1. API 엔드포인트
                { // 2. 요청 Body (서버로 보낼 데이터)
                    rating: rating,
                    content: content,
                },
                { // 3. 요청 Header (인증 토큰 등)
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // JWT 인증 토큰
                    }
                }
            );

            // 성공적으로 응답을 받았을 때
            if (response.status === 200) {
                alert("소중한 후기 감사합니다!");
                setRating(0);
                setContent("");
            }

        } catch (error) {
            // API 호출 실패 시 에러 처리
            console.error("리뷰 등록 실패:", error);
            if (error.response && error.response.status === 401) {
                alert("로그인이 필요합니다.");
                // TODO: 로그인 페이지로 리다이렉트하는 로직 추가
            } else {
                alert("리뷰 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            }
        } finally {
            setIsSubmitting(false); // 로딩 상태 해제
        }
        // --- 👆 백엔드 연동 로직 끝 ---
    };

    return (
        <div
            className="bg-white rounded-2xl shadow-lg p-8 mt-8"
            data-aos="fade-up"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">후기 작성하기</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">
                            만족도
                        </label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-md font-semibold text-gray-700 mb-2">후기 내용</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="5"
                            placeholder="제품에 대한 솔직한 후기를 남겨주세요."
                            required
                            disabled={isSubmitting} // 제출 중 비활성화
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
                        disabled={isSubmitting} // 제출 중 비활성화
                    >
                        {isSubmitting ? '등록 중...' : '후기 등록'}
                    </button>
                </div>
            </form>
        </div>
    );
}
