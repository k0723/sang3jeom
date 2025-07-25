import React, {useState} from 'react';
import {Star, Paperclip} from 'lucide-react';
import axios from 'axios';

// 별점 컴포넌트
const StarRating = ({rating, setRating}) => {
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
                        <div style={{position: 'relative', display: 'inline-block'}}>
                            <Star color="#e4e5e9" fill="#e4e5e9" size={28}/>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                overflow: 'hidden',
                                width: fillPercentage
                            }}>
                                <Star color="#ffc107" fill="#ffc107" size={28}/>
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
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("별점을 선택해주세요.");
            return;
        }

        setIsSubmitting(true); // 제출 시작 시 로딩 상태로 변경

        let uploadedImageUrl = null;

        // --- 백엔드 연동 로직 ---
        try {
            // 1. 이미지 파일이 있으면 S3에 먼저 업로드
            if (imageFile) {
                // 1-1. 백엔드에 Presigned URL 요청
                const presignedResponse = await axios.post('/api/images/presigned-url', {
                    filename: imageFile.name
                });
                const presignedUrl = presignedResponse.data;

                // 1-2. 받은 Presigned URL로 S3에 직접 파일 업로드
                await axios.put(presignedUrl, imageFile, {
                    headers: {'Content-Type': imageFile.type}
                });

                // 1-3. 최종 저장될 이미지 URL 계산 (쿼리 스트링 제거)
                uploadedImageUrl = presignedUrl.split('?')[0];
            }

            // 임시 사용자 ID (실제로는 로그인 후 받아야 함)
            const userId = 1; // 테스트용 임시 ID

            await axios.post(
                '/api/reviews',
                {
                    rating: rating,
                    content: content,
                    imageUrl: uploadedImageUrl, // S3에 업로드된 이미지 URL 포함
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-ID': userId // 백엔드에서 요구하는 헤더
                    }
                }
            );

            alert("소중한 후기 감사합니다!");
            // 폼 초기화
            setRating(0);
            setContent("");
            setImageFile(null);
            document.getElementById('image-upload').value = "";

        } catch (error) {
            console.error("리뷰 등록 실패:", error);
            console.error("응답 데이터:", error.response?.data);
            console.error("응답 상태:", error.response?.status);
            
            const errorMsg = error.response?.data?.message || "알 수 없는 오류가 발생했습니다.";
            alert(`리뷰 등록 실패: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
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
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="image-upload-label" className="block text-md font-semibold text-gray-700 mb-2">
                            이미지 첨부 (선택)
                        </label>
                        <div className="mt-1 flex items-center">
                            <label id="image-upload-label" htmlFor="image-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                                <Paperclip size={16} className="inline-block mr-2" />
                                파일 선택
                            </label>
                            <input id="image-upload" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" disabled={isSubmitting} />
                            {imageFile && <span className="ml-3 text-sm text-gray-500">{imageFile.name}</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '등록 중...' : '후기 등록'}
                    </button>
                </div>
            </form>
        </div>
    );
}
