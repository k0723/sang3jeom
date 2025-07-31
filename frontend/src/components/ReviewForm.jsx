import React, {useState} from 'react';
import {Star, Paperclip} from 'lucide-react';
import { reviewAPIService } from '../utils/reviewAPI';

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
        
        if (!content.trim()) {
            alert("후기 내용을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);

        try {
            let uploadedImageUrl = null;

            // 이미지가 있는 경우 업로드 처리
            if (imageFile) {
                // TODO: 이미지 업로드 API 구현 필요
                // 현재는 임시로 FormData를 사용하여 처리
                const formData = new FormData();
                formData.append('image', imageFile);
                
                // 실제 환경에서는 별도의 이미지 업로드 API를 호출해야 함
                console.log('이미지 업로드 로직 구현 필요:', imageFile.name);
                // uploadedImageUrl = await uploadImageToServer(formData);
            }

            // 리뷰 데이터 준비
            const reviewData = {
                rating: rating,
                content: content.trim(),
                imageUrls: uploadedImageUrl ? [uploadedImageUrl] : []
            };

            // 리뷰 작성 API 호출
            await reviewAPIService.createReview(reviewData);

            alert("소중한 후기 감사합니다!");
            
            // 폼 초기화
            setRating(0);
            setContent("");
            setImageFile(null);
            const fileInput = document.getElementById('image-upload');
            if (fileInput) {
                fileInput.value = "";
            }

            // 페이지 새로고침 또는 리뷰 목록 업데이트
            window.location.reload();

        } catch (error) {
            console.error("리뷰 등록 실패:", error);
            if (error.response?.status === 400) {
                alert("이미 리뷰를 작성하셨거나 잘못된 요청입니다.");
            } else if (error.response?.status === 401) {
                alert("로그인이 필요합니다.");
            } else {
                alert("리뷰 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            }
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
