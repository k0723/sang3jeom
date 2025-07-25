import React, { useState } from "react";

const EMOJIS = ["😊", "😍", "😂", "👍", "🥳", "😎", "😭", "🔥", "🎉", "😆", "😇", "😺", "🐶", "🌸", "🍀", "🍕", "❤️", "⭐", "😜", "😏"];

const DUMMY_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca"
];

export default function PostUploadModal({ open, onClose, image: initialImage, onPost, user }) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("전체 공개");
  // 이미지 선택: 더미 이미지 중 하나 선택
  const [image, setImage] = useState(initialImage || DUMMY_IMAGES[0]);
  const [showEmoji, setShowEmoji] = useState(false);

  if (!open) return null;

  // 더 이상 파일 업로드 핸들러 필요 없음

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
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="프로필" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-gray-500 text-xl">👤</span>
            )}
          </div>
          <div>
            <div className="font-semibold">{user?.name || "이주형"}</div>
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
        {/* 이미지 선택 썸네일 */}
        <div className="w-full flex gap-2 mb-2 justify-center">
          {DUMMY_IMAGES.map((img, idx) => (
            <button
              key={img}
              type="button"
              className={`border-2 rounded-lg p-1 ${image === img ? 'border-blue-500' : 'border-transparent'}`}
              onClick={() => setImage(img)}
              style={{ background: image === img ? '#e0f2fe' : 'transparent' }}
            >
              <img src={img} alt={`굿즈 이미지 ${idx+1}`} className="w-20 h-20 object-cover rounded-md" />
            </button>
          ))}
        </div>
        {/* 선택된 이미지 미리보기 */}
        {image && (
          <div className="relative w-full flex justify-center mb-2">
            <img src={image} alt="굿즈 이미지" className="max-h-56 rounded-lg object-contain" />
          </div>
        )}
        {/* 이모지 버튼 영역 */}
        <div className="flex w-full justify-end gap-2 mb-3 relative">
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