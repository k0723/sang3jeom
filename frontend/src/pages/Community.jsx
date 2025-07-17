import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, X, Send, Lock } from 'lucide-react';

// 게시글 상세+댓글 모달
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

function CommunityPostDetailModal({ post, isOpen, onClose, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentValue, setEditCommentValue] = useState('');
  const [commentMenuOpenId, setCommentMenuOpenId] = useState(null);

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    try {
      setCommentLoading(true);
      const response = await axios.get(`http://localhost:8083/comments/post/${post.id}`);
      setComments(response.data);
    } catch (err) {
      console.error('댓글 조회 실패:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setLoading(true);
      await axios.post(`http://localhost:8083/comments`, {
        content: newComment,
        goodsPostId: post.id,
        userId: 1, // 임시 사용자 ID
        userName: '사용자' // 임시 사용자명
      });
      setNewComment('');
      await fetchComments();
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`http://localhost:8083/comments/${commentId}`);
      await fetchComments();
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 댓글 수정 시작
  const handleEditStart = (comment) => {
    setEditCommentId(comment.id);
    setEditCommentValue(comment.content);
  };
  // 댓글 수정 취소
  const handleEditCancel = () => {
    setEditCommentId(null);
    setEditCommentValue('');
  };
  // 댓글 수정 저장
  const handleEditSave = async (commentId) => {
    if (!editCommentValue.trim()) return;
    try {
      await axios.put(`http://localhost:8083/comments/${commentId}`, {
        content: editCommentValue
      });
      setEditCommentId(null);
      setEditCommentValue('');
      await fetchComments();
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 메뉴 토글
  const handleMenuToggle = (commentId) => {
    setCommentMenuOpenId(prev => (prev === commentId ? null : commentId));
  };

  useEffect(() => {
    if (isOpen) fetchComments();
    // eslint-disable-next-line
  }, [isOpen, post.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col shadow-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-white font-bold text-lg">
              {post.userName ? post.userName[0] : 'U'}
            </div>
            <div>
              <div className="font-semibold">{post.userName || 'Unknown User'}</div>
              <div className="text-xs text-gray-500">{formatRelativeTime(post.createdAt)} · <span className="inline-block align-middle">🌐</span></div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* 본문 */}
        <div className="p-4 border-b border-gray-200">
          <div className="text-gray-800 whitespace-pre-line mb-2">{post.content}</div>
          {post.imageUrl && (
            <div className="flex justify-center items-center bg-gray-50 rounded-lg min-h-[180px] mb-2 overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt="굿즈 이미지" 
                className="max-h-72 w-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center justify-center min-h-[180px] text-gray-500">
                <span>이미지를 불러올 수 없습니다</span>
              </div>
            </div>
          )}
        </div>
        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <div className="font-semibold mb-2 text-gray-700 mt-4">댓글</div>
          {commentLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">아직 댓글이 없습니다</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {comments.map((comment, idx) => (
                <div key={comment.id} className={`flex gap-3 py-4 relative`}> {/* relative for menu positioning */}
                  <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                    {comment.userName ? comment.userName[0] : 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    {editCommentId === comment.id ? (
                      <div className="flex gap-2 items-center mb-1">
                        <input
                          type="text"
                          value={editCommentValue}
                          onChange={e => setEditCommentValue(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded"
                        />
                        <button onClick={() => handleEditSave(comment.id)} className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold">저장</button>
                        <button onClick={handleEditCancel} className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">취소</button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <p className="text-sm text-gray-800 mb-1 flex-1">{comment.content}</p>
                        <div className="relative ml-2">
                          <button onClick={() => handleMenuToggle(comment.id)} className="p-1 rounded-full hover:bg-gray-100">
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                          </button>
                          {commentMenuOpenId === comment.id && (
                            <div className="absolute right-0 mt-2 w-20 bg-white border border-gray-200 rounded shadow z-10">
                              <button onClick={() => { handleEditStart(comment); setCommentMenuOpenId(null); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 text-blue-600">수정</button>
                              <button onClick={() => { handleDeleteComment(comment.id); setCommentMenuOpenId(null); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-500">삭제</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 댓글 입력 */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CommunityPostEditModal({ post, isOpen, onClose, onUpdated }) {
  const [content, setContent] = useState(post?.content || '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const [status, setStatus] = useState(post?.status || 'PUBLISHED');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content || '');
      setImageUrl(post.imageUrl || '');
      setStatus(post.status || 'PUBLISHED');
    }
  }, [isOpen, post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:8083/goods-posts/${post.id}`, {
        content,
        imageUrl,
        status
      });
      alert('수정되었습니다.');
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      alert('수정 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !post) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative flex flex-col items-center justify-center">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="닫기"
        >×</button>
        <h2 className="text-xl font-bold mb-4">게시글 수정</h2>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">내용</label>
            <textarea
              className="w-full border rounded p-2 min-h-[80px]"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">이미지 URL</label>
            <input
              className="w-full border rounded p-2"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="이미지 URL 입력"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">상태</label>
            <select
              className="w-full border rounded p-2"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="ALL">전체 공개</option>
              <option value="PRIVATE">나만 보기</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-300"
            disabled={loading}
          >
            {loading ? '수정 중...' : '수정하기'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CommunityPost({ post, isLiked, likeLoading, onEdit, onDelete, onShare, onSave, onDetail, onLikeToggle, onCommentClick }) {
  const [showMenu, setShowMenu] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  
  // 시간 포맷팅 함수
  const formatTime = (createdAt) => formatRelativeTime(createdAt);

  // 좋아요 토글
  const handleLikeToggle = async () => {
    setPosts(prevPosts => prevPosts.map(post =>
      post.id === postId ? { ...post, likeLoading: true } : post
    ));
    try {
      const response = await axios.post(`http://localhost:8083/likes/${postId}`);
      const { liked, likeCount: newLikeCount } = response.data;
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId
          ? { ...post, isLiked: liked, likeCount: newLikeCount, likeLoading: false }
          : post
      ));
    } catch {
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId ? { ...post, likeLoading: false } : post
      ));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      {/* 상단: 유저, 시간, ... */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-white font-bold text-lg">
            {post.userName ? post.userName[0] : 'U'}
          </div>
          <div>
            <div className="font-semibold">{post.userName || 'Unknown User'}</div>
            <div className="text-xs text-gray-500">
              {formatTime(post.createdAt)} ·{" "}
              {post.status === "PRIVATE" ? (
                <Lock className="inline-block w-4 h-4 align-middle" />
              ) : (
                <span className="inline-block align-middle">🌐</span>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)} className="p-2 rounded-full hover:bg-gray-100">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
          {showMenu && (
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
      {/* 이미지 영역 */}
      {post.imageUrl && (
        <div className="flex justify-center items-center bg-gray-50 rounded-lg min-h-[240px] mb-4 overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt="굿즈 이미지" 
            className="max-h-96 w-full object-contain rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden items-center justify-center min-h-[240px] text-gray-500">
            <span>이미지를 불러올 수 없습니다</span>
          </div>
        </div>
      )}
      {/* 하단: 좋아요, 댓글, 저장, 공유 */}
      <div className="flex items-center justify-between text-gray-500 text-sm border-t pt-3">
        <div className="flex items-center gap-6">
          <button
            className={`flex items-center gap-1 hover:text-red-500 ${isLiked ? 'text-red-500' : ''} ${likeLoading ? 'opacity-50 cursor-wait' : ''}`}
            onClick={onLikeToggle}
            disabled={likeLoading}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            좋아요 {post.likeCount || 0}
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500" onClick={() => onCommentClick(post)}>
            <MessageCircle className="w-5 h-5" /> 댓글 {post.commentCount || 0}
          </button>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1 hover:text-blue-500" onClick={() => onSave(post)}>
            <Bookmark className="w-5 h-5" /> 이미지 저장
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500" onClick={() => onShare(post)}>
            <Share2 className="w-5 h-5" /> 공유하기 0
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  // 추가: 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTargetPost, setEditTargetPost] = useState(null);

  // 게시글 데이터 + 좋아요 상태 가져오기
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8083/goods-posts');
      const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // 각 게시글에 대해 좋아요 상태 체크
      const userId = 1; // 임시
      const postsWithLike = await Promise.all(sortedPosts.map(async (post) => {
        try {
          const res = await axios.get(`http://localhost:8083/likes/post/${post.id}/check`);
          return { ...post, isLiked: res.data.liked };
        } catch {
          return { ...post, isLiked: false };
        }
      }));
      setPosts(postsWithLike);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && visibleCount < posts.length) {
        setVisibleCount((prev) => Math.min(prev + 2, posts.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, posts.length]);

  // 상세 모달 열기
  const handleCommentClick = (post) => {
    setSelectedPost(post);
    setDetailModalOpen(true);
  };
  // 상세 모달 닫기
  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setSelectedPost(null);
  };
  // 댓글 추가 후 콜백
  const handleCommentAdded = () => { fetchPosts(); };

  // 좋아요 토글 후 콜백
  const handleLikeToggle = async (postId) => {
    setPosts(prevPosts => prevPosts.map(post =>
      post.id === postId ? { ...post, likeLoading: true } : post
    ));
    try {
      const response = await axios.post(`http://localhost:8083/likes/${postId}`);
      const { liked, likeCount: newLikeCount } = response.data;
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId
          ? { ...post, isLiked: liked, likeCount: newLikeCount, likeLoading: false }
          : post
      ));
    } catch {
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId ? { ...post, likeLoading: false } : post
      ));
    }
  };

  // 수정 모달 열기
  const handleEdit = (post) => {
    setEditTargetPost(post);
    setEditModalOpen(true);
  };
  // 수정 모달 닫기
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditTargetPost(null);
  };
  // 삭제 연동
  const handleDelete = async (post) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`http://localhost:8083/goods-posts/${post.id}`);
      alert('삭제되었습니다.');
      fetchPosts();
    } catch (err) {
      alert('삭제 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  // 핸들러(placeholder)
  const handleShare = (post) => alert('공유');
  const handleSave = (post) => alert('이미지 저장');
  const handleDetail = (post) => alert('상세보기');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-xl mx-auto pt-28 px-2">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">게시글을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-xl mx-auto pt-28 px-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchPosts}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Navbar />
      <div className="max-w-xl mx-auto pt-28 px-2">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-500 text-lg mb-4">아직 게시글이 없습니다</div>
            <div className="text-gray-400">첫 번째 굿즈를 자랑해보세요!</div>
          </div>
        ) : (
          posts.slice(0, visibleCount).map(post => (
            <CommunityPost
              key={post.id}
              post={post}
              isLiked={post.isLiked}
              likeLoading={post.likeLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={handleShare}
              onSave={handleSave}
              onDetail={handleDetail}
              onLikeToggle={() => handleLikeToggle(post.id)}
              onCommentClick={handleCommentClick}
            />
          ))
        )}
      </div>
      {/* 상세+댓글 모달 */}
      {selectedPost && (
        <CommunityPostDetailModal
          post={selectedPost}
          isOpen={detailModalOpen}
          onClose={handleDetailModalClose}
          onCommentAdded={handleCommentAdded}
        />
      )}
      {/* 게시글 수정 모달 */}
      <CommunityPostEditModal
        post={editTargetPost}
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        onUpdated={fetchPosts}
      />
      <button className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl font-bold z-50">
        +
      </button>
    </div>
  );
} 