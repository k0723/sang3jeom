import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

// 샘플 게시글 데이터
const samplePosts = [
  {
    id: 1,
    user: { name: 'User-NAME', avatar: null },
    time: '18시간',
    content: '게시글 본문(content)',
    image: null,
    aiImage: true,
    likes: 4,
    comments: 1,
    shares: 2,
    isMine: true,
  },
  {
    id: 2,
    user: { name: 'AI유저', avatar: null },
    time: '1일',
    content: '이것이 AI 굿즈!',
    image: null,
    aiImage: true,
    likes: 2,
    comments: 0,
    shares: 0,
    isMine: false,
  },
  {
    id: 3,
    user: { name: '상상이', avatar: null },
    time: '2일',
    content: '상상공간에 첫 글 남겨요!',
    image: null,
    aiImage: true,
    likes: 1,
    comments: 0,
    shares: 1,
    isMine: false,
  },
  {
    id: 4,
    user: { name: '굿즈러버', avatar: null },
    time: '3일',
    content: 'AI로 만든 머그컵 자랑!',
    image: null,
    aiImage: true,
    likes: 3,
    comments: 2,
    shares: 1,
    isMine: false,
  },
  {
    id: 5,
    user: { name: '테스터', avatar: null },
    time: '4일',
    content: '상상공간 최고!',
    image: null,
    aiImage: true,
    likes: 0,
    comments: 0,
    shares: 0,
    isMine: false,
  },
];

function CommunityPost({ post, onEdit, onDelete, onLike, onComment, onShare, onSave, onDetail }) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      {/* 상단: 유저, 시간, ... */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-white font-bold text-lg">
            {post.user.avatar ? <img src={post.user.avatar} alt="avatar" className="w-10 h-10 rounded-full" /> : post.user.name[0]}
          </div>
          <div>
            <div className="font-semibold">{post.user.name}</div>
            <div className="text-xs text-gray-500">{post.time} · <span className="inline-block align-middle">🌐</span></div>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)} className="p-2 rounded-full hover:bg-gray-100">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
          {showMenu && post.isMine && (
            <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-10">
              <button onClick={() => onEdit(post)} className="block w-full px-4 py-2 text-left hover:bg-gray-50">수정</button>
              <button onClick={() => onDelete(post)} className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-red-500">삭제</button>
            </div>
          )}
        </div>
      </div>
      {/* 본문 */}
      <div className="mb-4">
        <div className="text-gray-800 whitespace-pre-line">
          {post.content}
        </div>
      </div>
      {/* AI 이미지 영역 */}
      <div className="flex justify-center items-center bg-gray-50 rounded-lg min-h-[240px] mb-4">
        <span className="text-3xl font-extrabold text-gray-800"><span className="font-black">AI</span> 이미지 영역</span>
      </div>
      {/* 하단: 좋아요, 댓글, 저장, 공유 */}
      <div className="flex items-center justify-between text-gray-500 text-sm border-t pt-3">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1 hover:text-blue-500" onClick={() => onLike(post)}>
            <Heart className="w-5 h-5" /> 좋아요 {post.likes}
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500" onClick={() => onComment(post)}>
            <MessageCircle className="w-5 h-5" /> 댓글 {post.comments}
          </button>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1 hover:text-blue-500" onClick={() => onSave(post)}>
            <Bookmark className="w-5 h-5" /> 이미지 저장
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500" onClick={() => onShare(post)}>
            <Share2 className="w-5 h-5" /> 공유하기 {post.shares}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Community() {
  const [posts] = useState(samplePosts);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        visibleCount < posts.length
      ) {
        setVisibleCount((prev) => Math.min(prev + 2, posts.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, posts.length]);

  // TODO: 무한 스크롤, 게시글 업로드 모달 연동 등

  // 핸들러(placeholder)
  const handleEdit = (post) => alert('수정 기능');
  const handleDelete = (post) => alert('삭제 기능');
  const handleLike = (post) => alert('좋아요');
  const handleComment = (post) => alert('댓글');
  const handleShare = (post) => alert('공유');
  const handleSave = (post) => alert('이미지 저장');
  const handleDetail = (post) => alert('상세보기');

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Navbar />
      <div className="max-w-xl mx-auto pt-28 px-2">
        {/* 게시글 피드 */}
        {posts.slice(0, visibleCount).map(post => (
          <CommunityPost
            key={post.id}
            post={post}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onSave={handleSave}
            onDetail={handleDetail}
          />
        ))}
      </div>
      {/* 굿즈 자랑하기 플로팅 버튼 (업로드 모달 연동 예정) */}
      <button className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl font-bold z-50">
        +
      </button>
    </div>
  );
} 