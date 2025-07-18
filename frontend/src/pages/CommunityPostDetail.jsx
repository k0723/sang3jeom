import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, X, Send, Lock, ArrowLeft } from 'lucide-react';

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

  // 게시글 데이터 가져오기
  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8083/goods-posts/${id}`);
      setPost(response.data);
      setLikeCount(response.data.likeCount || 0);
      
      // 좋아요 상태 체크
      try {
        const likeResponse = await axios.get(`http://localhost:8083/likes/post/${id}/check`);
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
      const response = await axios.post(`http://localhost:8083/likes/${id}`);
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
      await axios.post(`http://localhost:8083/comments`, {
        content: newComment,
        goodsPostId: id,
        userId: 1, // 임시 사용자 ID
        userName: '사용자' // 임시 사용자명
      });
      setNewComment('');
      await fetchComments();
    } catch (err) {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setCommentSubmitting(false);
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
  }, [id]);

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
            <button 
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100"
              title="공유하기"
            >
              <Share2 className="w-5 h-5 text-gray-500" />
            </button>
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
                    <p className="text-gray-800">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 