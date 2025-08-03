-- ===========================================
-- 상삼점(상점) MSA 데이터베이스 마이그레이션 스크립트
-- 기존 통합 DB에서 분리된 DB로 데이터 이전
-- ===========================================

-- 1. 기존 통합 데이터베이스에서 데이터 추출
-- (기존 DB가 있다고 가정)

-- User Service 데이터 마이그레이션
-- 기존 DB에서 Users 테이블 데이터를 user_db로 이전
INSERT INTO user_db.Users (
    id, provider, providerId, username, email, passwordHash, 
    roles, name, profileImageUrl, phone, createdAt
)
SELECT 
    id, provider, providerId, username, email, passwordHash,
    roles, name, profileImageUrl, phone, createdAt
FROM sang3jeom_db.Users
WHERE id IS NOT NULL;

-- UserAiGoods 데이터 마이그레이션
INSERT INTO user_db.UserAiGoods (
    id, userId, goodsName, description, price, imageUrl, createdAt
)
SELECT 
    id, userId, goodsName, description, price, imageUrl, createdAt
FROM sang3jeom_db.UserAiGoods
WHERE id IS NOT NULL;

-- UserAiImage 데이터 마이그레이션
INSERT INTO user_db.UserAiImage (
    id, userId, imageUrl, prompt, createdAt
)
SELECT 
    id, userId, imageUrl, prompt, createdAt
FROM sang3jeom_db.UserAiImage
WHERE id IS NOT NULL;

-- Community Service 데이터 마이그레이션
-- Goods Posts 데이터 이전
INSERT INTO community_db.goods_posts (
    id, content, userId, userEmail, userName, imageUrl, 
    status, createdAt, updatedAt
)
SELECT 
    id, content, userId, userEmail, userName, imageUrl,
    status, createdAt, updatedAt
FROM sang3jeom_db.goods_posts
WHERE id IS NOT NULL;

-- Comments 데이터 이전
INSERT INTO community_db.comments (
    id, content, postId, userId, userEmail, userName, 
    createdAt, updatedAt
)
SELECT 
    id, content, postId, userId, userEmail, userName,
    createdAt, updatedAt
FROM sang3jeom_db.comments
WHERE id IS NOT NULL;

-- Likes 데이터 이전
INSERT INTO community_db.likes (
    id, postId, userId, createdAt
)
SELECT 
    id, postId, userId, createdAt
FROM sang3jeom_db.likes
WHERE id IS NOT NULL;

-- Order Service 데이터 마이그레이션
-- Orders 데이터 이전
INSERT INTO order_db.orders (
    id, userId, status, orderDate, address, memo,
    userName, price, quantity, goodsId, goodsName
)
SELECT 
    id, userId, status, orderDate, address, memo,
    userName, price, quantity, goodsId, goodsName
FROM sang3jeom_db.orders
WHERE id IS NOT NULL;

-- Order Items 데이터 이전 (있는 경우)
INSERT INTO order_db.order_items (
    id, orderId, goodsId, goodsName, quantity, price, createdAt
)
SELECT 
    id, orderId, goodsId, goodsName, quantity, price, createdAt
FROM sang3jeom_db.order_items
WHERE id IS NOT NULL;

-- Review Service 데이터 마이그레이션
-- Reviews 데이터 이전
INSERT INTO review_db.reviews (
    id, content, imageUrl, rating, userId, orderId,
    createdAt, updatedAt
)
SELECT 
    id, content, imageUrl, rating, userId, orderId,
    createdAt, updatedAt
FROM sang3jeom_db.reviews
WHERE id IS NOT NULL;

-- Review Statistics 데이터 계산 및 이전
INSERT INTO review_db.review_statistics (
    goodsId, averageRating, totalReviews,
    fiveStarCount, fourStarCount, threeStarCount,
    twoStarCount, oneStarCount, lastUpdated
)
SELECT 
    goodsId,
    AVG(rating) as averageRating,
    COUNT(*) as totalReviews,
    SUM(CASE WHEN rating = 5.0 THEN 1 ELSE 0 END) as fiveStarCount,
    SUM(CASE WHEN rating = 4.0 THEN 1 ELSE 0 END) as fourStarCount,
    SUM(CASE WHEN rating = 3.0 THEN 1 ELSE 0 END) as threeStarCount,
    SUM(CASE WHEN rating = 2.0 THEN 1 ELSE 0 END) as twoStarCount,
    SUM(CASE WHEN rating = 1.0 THEN 1 ELSE 0 END) as oneStarCount,
    NOW() as lastUpdated
FROM sang3jeom_db.reviews
GROUP BY goodsId;

-- ===========================================
-- 마이그레이션 검증 쿼리
-- ===========================================

-- 각 서비스별 데이터 개수 확인
SELECT 'User Service' as service, COUNT(*) as count FROM user_db.Users
UNION ALL
SELECT 'UserAiGoods' as service, COUNT(*) as count FROM user_db.UserAiGoods
UNION ALL
SELECT 'UserAiImage' as service, COUNT(*) as count FROM user_db.UserAiImage
UNION ALL
SELECT 'Community Posts' as service, COUNT(*) as count FROM community_db.goods_posts
UNION ALL
SELECT 'Community Comments' as service, COUNT(*) as count FROM community_db.comments
UNION ALL
SELECT 'Community Likes' as service, COUNT(*) as count FROM community_db.likes
UNION ALL
SELECT 'Order Service' as service, COUNT(*) as count FROM order_db.orders
UNION ALL
SELECT 'Review Service' as service, COUNT(*) as count FROM review_db.reviews;

-- ===========================================
-- 마이그레이션 후 정리 작업
-- ===========================================

-- 1. 각 데이터베이스의 AUTO_INCREMENT 값 조정
ALTER TABLE user_db.Users AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM user_db.Users);
ALTER TABLE user_db.UserAiGoods AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM user_db.UserAiGoods);
ALTER TABLE user_db.UserAiImage AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM user_db.UserAiImage);

ALTER TABLE community_db.goods_posts AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM community_db.goods_posts);
ALTER TABLE community_db.comments AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM community_db.comments);
ALTER TABLE community_db.likes AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM community_db.likes);

ALTER TABLE order_db.orders AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM order_db.orders);
ALTER TABLE order_db.order_items AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM order_db.order_items);

ALTER TABLE review_db.reviews AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM review_db.reviews);
ALTER TABLE review_db.review_statistics AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM review_db.review_statistics);

-- 2. 인덱스 재생성 (성능 최적화)
ANALYZE TABLE user_db.Users;
ANALYZE TABLE user_db.UserAiGoods;
ANALYZE TABLE user_db.UserAiImage;

ANALYZE TABLE community_db.goods_posts;
ANALYZE TABLE community_db.comments;
ANALYZE TABLE community_db.likes;

ANALYZE TABLE order_db.orders;
ANALYZE TABLE order_db.order_items;

ANALYZE TABLE review_db.reviews;
ANALYZE TABLE review_db.review_statistics;

-- ===========================================
-- 마이그레이션 완료 확인
-- ===========================================

-- 각 서비스별 데이터 무결성 검증
SELECT 'User Service Data Integrity Check' as check_type;
SELECT COUNT(*) as total_users FROM user_db.Users;
SELECT COUNT(*) as total_ai_goods FROM user_db.UserAiGoods;
SELECT COUNT(*) as total_ai_images FROM user_db.UserAiImage;

SELECT 'Community Service Data Integrity Check' as check_type;
SELECT COUNT(*) as total_posts FROM community_db.goods_posts;
SELECT COUNT(*) as total_comments FROM community_db.comments;
SELECT COUNT(*) as total_likes FROM community_db.likes;

SELECT 'Order Service Data Integrity Check' as check_type;
SELECT COUNT(*) as total_orders FROM order_db.orders;
SELECT COUNT(*) as total_order_items FROM order_db.order_items;

SELECT 'Review Service Data Integrity Check' as check_type;
SELECT COUNT(*) as total_reviews FROM review_db.reviews;
SELECT COUNT(*) as total_statistics FROM review_db.review_statistics; 