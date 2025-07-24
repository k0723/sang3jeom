import React, { useState } from "react";

const EMOJIS = ["😊", "😍", "😂", "👍", "🥳", "😎", "😭", "🔥", "🎉", "😆", "😇", "😺", "🐶", "🌸", "🍀", "🍕", "❤️", "⭐", "😜", "😏"];

export default function PostUploadModal({ open, onClose, image: initialImage, onPost }) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("전체 공개");
  // 테스트용 하드코딩 이미지 URL - 추후 S3 버킷에서 가져올 예정
  const [image, setImage] = useState(initialImage || "https://placehold.co/600x400");
  const [showEmoji, setShowEmoji] = useState(false);

  if (!open) return null;

  // 파일 업로드 핸들러(샘플, 실제 업로드는 별도 구현 필요)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setContent(content + emoji);
    setShowEmoji(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="닫기"
        >×</button>
        <h2 className="text-lg font-bold mb-4">굿즈 게시물 만들기</h2>
        {/* 프로필/공개범위/본문 */}
        <div className="flex items-center w-full mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
            <span className="text-gray-500 text-xl">👤</span>
          </div>
          <div>
            <div className="font-semibold">이주형</div>
            <select
              className="text-xs border rounded px-2 py-1 mt-1"
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
            >
              <option>전체 공개</option>
              <option>나만 보기</option>
            </select>
          </div>
        </div>
        <textarea
          className="w-full border rounded p-3 mb-2 min-h-[80px] resize-none"
          placeholder="상상공간 게시글 본문"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        {/* 첨부 이미지 */}
        {image && (
          <div className="relative w-full flex justify-center mb-2">
            <img src={image} alt="굿즈 이미지" className="max-h-56 rounded-lg object-contain" />
            <button
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-xl text-gray-500 hover:text-red-500"
              onClick={() => setImage(null)}
              aria-label="이미지 삭제"
            >×</button>
          </div>
        )}
        {/* 사진/이모지 버튼 영역 */}
        <div className="flex w-full justify-end gap-2 mb-3 relative">
          <label className="cursor-pointer flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full text-2xl">
            <span role="img" aria-label="사진">🖼️</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full text-2xl relative"
              onClick={() => setShowEmoji((v) => !v)}
            >
              <span role="img" aria-label="이모지">😊</span>
            </button>
            {showEmoji && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white border rounded-xl shadow-lg p-2 grid grid-cols-5 gap-2 z-10" style={{ width: '220px' }}>
                {/* 꼬리(삼각형) */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rounded-tl-xl rotate-45 z-[-1]" />
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className="text-2xl hover:bg-gray-100 rounded p-2 text-center"
                    onClick={() => handleEmojiSelect(emoji)}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg mt-2"
          onClick={() => { onPost({ content, visibility, image }); onClose(); }}
          disabled={!content.trim()}
        >
          게시
        </button>
      </div>
    </div>
  );
} 