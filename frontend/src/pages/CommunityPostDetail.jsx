import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, X, Send, Lock, ArrowLeft, Edit, Trash2, CheckCircle, MoreVertical } from 'lucide-react';

const EMOJIS = ["😊", "😍", "😂", "👍", "🥳", "😎", "😭", "🔥", "🎉", "😆", "😇", "😺", "🐶", "🌸", "🍀", "🍕", "❤️", "⭐", "😜", "😏"];

const DUMMY_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca"
];

function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

export default function CommunityPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentValue, setEditCommentValue] = useState('');
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editVisibility, setEditVisibility] = useState('전체 공개');
  const [editLoading, setEditLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // 현재 유저 정보 가져오기
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      
      const response = await fetch("http://localhost:8080/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error('유저 정보 가져오기 실패:', err);
    }
  };

  // 게시글 데이터 가져오기
  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8083/goods-posts/${id}`);
      setPost(response.data);
      setLikeCount(response.data.likeCount || 0);
      
      // 좋아요 상태 체크
      try {
        const token = localStorage.getItem("accessToken");
        const likeResponse = await axios.get(`http://localhost:8083/likes/post/${id}/check`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIsLiked(likeResponse.data.liked);
      } catch {
        setIsLiked(false);
      }
    } catch (err) {
      setError('게시글을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    try {
      setCommentLoading(true);
      const response = await axios.get(`http://localhost:8083/comments/post/${id}`);
      setComments(response.data);
    } catch (err) {
      console.error('댓글 조회 실패:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  // 좋아요 토글
  const handleLikeToggle = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(`http://localhost:8083/likes/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const { liked, likeCount: newLikeCount } = response.data;
      setIsLiked(liked);
      setLikeCount(newLikeCount);
    } catch (err) {
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  // 댓글 작성
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      setCommentSubmitting(true);
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `http://localhost:8083/comments`,
        {
          content: newComment,
          goodsPostId: Number(id)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setNewComment('');
      await fetchComments();
    } catch (err) {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // 댓글 수정 시작
  const handleEditStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentValue(comment.content);
  };

  // 댓글 수정 취소
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditCommentValue('');
  };

  // 댓글 수정 저장
  const handleCommentEditSave = async (commentId) => {
    if (!editCommentValue.trim()) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:8083/comments/${commentId}`,
        {
          content: editCommentValue
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setEditingCommentId(null);
      setEditCommentValue('');
      await fetchComments();
    } catch (err) {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(
        `http://localhost:8083/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      await fetchComments();
    } catch (err) {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 게시글 수정 모달 열기
  const handleEditPost = () => {
    setEditContent(post.content || '');
    setEditImage(post.imageUrl || DUMMY_IMAGES[0]);
    setEditVisibility(post.status === 'PRIVATE' ? '나만 보기' : '전체 공개');
    setEditModalOpen(true);
    setShowPostMenu(false);
  };

  // 게시글 수정 모달 닫기
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditContent('');
    setEditImage('');
    setEditVisibility('전체 공개');
    setShowEmoji(false);
  };

  // 이모지 선택
  const handleEmojiSelect = (emoji) => {
    setEditContent(editContent + emoji);
    setShowEmoji(false);
  };

  // 게시글 수정 저장
  const handleEditSave = async () => {
    if (!editContent.trim()) return;
    
    setEditLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(`http://localhost:8083/goods-posts/${id}`, {
        content: editContent,
        imageUrl: editImage,
        status: editVisibility === '나만 보기' ? 'PRIVATE' : 'ALL'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // 게시글 정보 업데이트
      setPost(prev => ({
        ...prev,
        content: editContent,
        imageUrl: editImage,
        status: editVisibility === '나만 보기' ? 'PRIVATE' : 'ALL'
      }));
      
      alert('수정되었습니다.');
      handleEditModalClose();
    } catch (err) {
      alert('수정 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`http://localhost:8083/goods-posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (err) {
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  // 공유하기
  const handleShare = async () => {
    try {
      const detailUrl = `${window.location.origin}/community/post/${id}`;
      await navigator.clipboard.writeText(detailUrl);
      alert('게시글 링크가 복사되었습니다!');
    } catch (err) {
      alert('링크 복사에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
    fetchCurrentUser();
  }, [id]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPostMenu && !event.target.closest('.post-menu')) {
        setShowPostMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPostMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto pt-28 px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">게시글을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto pt-28 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error || '게시글을 찾을 수 없습니다.'}</p>
            <button 
              onClick={() => navigate('/community')}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              커뮤니티로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-28 px-4 pb-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-4">
          <Link 
            to="/community" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            커뮤니티로 돌아가기
          </Link>
        </div>

        {/* 게시글 카드 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* 상단: 유저, 시간, 공유 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center text-white font-bold text-xl">
                {post.userName ? post.userName[0] : 'U'}
              </div>
              <div>
                <div className="font-semibold text-lg">{post.userName || 'Unknown User'}</div>
                <div className="text-sm text-gray-500">
                  {formatRelativeTime(post.createdAt)} ·{" "}
                  {post.status === "PRIVATE" ? (
                    <Lock className="inline-block w-4 h-4 align-middle" />
                  ) : (
                    <span className="inline-block align-middle">🌐</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100"
                title="공유하기"
              >
                <Share2 className="w-5 h-5 text-gray-500" />
              </button>
              
              {/* 현재 유저의 게시글이면 수정/삭제 메뉴 표시 */}
              {currentUser && currentUser.id === post.userId && (
                <div className="relative post-menu">
                  <button 
                    onClick={() => setShowPostMenu(!showPostMenu)}
                    className="p-2 rounded-full hover:bg-gray-100"
                    title="더보기"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  {showPostMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setShowPostMenu(false);
                          handleEditPost();
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        수정
                      </button>
                      <button
                        onClick={() => {
                          setShowPostMenu(false);
                          handleDeletePost();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="mb-6">
            <div className="text-gray-800 whitespace-pre-line text-lg leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* 이미지 영역 */}
          {post.imageUrl && (
            <div className="flex justify-center items-center bg-gray-50 rounded-lg min-h-[400px] mb-6 overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt="굿즈 이미지" 
                className="max-h-96 w-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center justify-center min-h-[400px] text-gray-500">
                <span>이미지를 불러올 수 없습니다</span>
              </div>
            </div>
          )}

          {/* 좋아요 버튼 */}
          <div className="flex items-center justify-between text-gray-500 text-sm border-t pt-4 mb-6">
            <button
              className={`flex items-center gap-2 hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLikeToggle}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              좋아요 {likeCount}
            </button>
            <div className="text-gray-400">
              댓글 {comments.length}개
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">댓글</h3>
          
          {/* 댓글 입력 */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                U
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={commentSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={commentSubmitting || !newComment.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {commentSubmitting ? (
                  <div className="animate-spin rounded-full h-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          {/* 댓글 목록 */}
          {commentLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">아직 댓글이 없습니다</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {comment.userName ? comment.userName[0] : 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editCommentValue}
                          onChange={(e) => setEditCommentValue(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleCommentEditSave(comment.id)}
                          className="p-2 rounded-full hover:bg-green-100 text-green-600"
                          title="저장"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="p-2 rounded-full hover:bg-red-100 text-red-600"
                          title="취소"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800">{comment.content}</span>
                        {currentUser && currentUser.id === comment.userId && (
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <button
                              onClick={() => handleEditStart(comment)}
                              className="p-1 rounded-full hover:bg-gray-100"
                              title="수정"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 rounded-full hover:bg-gray-100 text-red-600"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 게시글 수정 모달 */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn min-h-screen">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative flex flex-col items-center">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700"
              onClick={handleEditModalClose}
              aria-label="닫기"
            >×</button>
            <h2 className="text-lg font-bold mb-4">게시글 수정</h2>
            {/* 프로필/공개범위/본문 */}
            <div className="flex items-center w-full mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                {currentUser?.profileImage ? (
                  <img src={currentUser.profileImage} alt="프로필" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-gray-500 text-xl">👤</span>
                )}
              </div>
              <div>
                <div className="font-semibold">{currentUser?.name}</div>
                <select
                  className="text-xs border rounded px-2 py-1 mt-1"
                  value={editVisibility}
                  onChange={e => setEditVisibility(e.target.value)}
                >
                  <option>전체 공개</option>
                  <option>나만 보기</option>
                </select>
              </div>
            </div>
            <textarea
              className="w-full border rounded p-3 mb-2 min-h-[80px] resize-none"
              placeholder="상상공간 게시글 본문"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            {/* 이미지 선택 썸네일 */}
            <div className="w-full flex gap-2 mb-2 justify-center">
              {DUMMY_IMAGES.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  className={`border-2 rounded-lg p-1 ${editImage === img ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => setEditImage(img)}
                  style={{ background: editImage === img ? '#e0f2fe' : 'transparent' }}
                >
                  <img src={img} alt={`굿즈 이미지 ${idx+1}`} className="w-20 h-20 object-cover rounded-md" />
                </button>
              ))}
            </div>
            {/* 선택된 이미지 미리보기 */}
            {editImage && (
              <div className="relative w-full flex justify-center mb-2">
                <img src={editImage} alt="굿즈 이미지" className="max-h-56 rounded-lg object-contain" />
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
              onClick={handleEditSave}
              disabled={!editContent.trim() || editLoading}
            >
              {editLoading ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 