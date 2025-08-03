-- Community Service Database Initialization Script
-- Database: community_db

USE community_db;

-- Goods Posts 테이블 생성
CREATE TABLE IF NOT EXISTS goods_posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT,
    userId BIGINT NOT NULL,
    userEmail VARCHAR(255) NOT NULL,
    userName VARCHAR(255) NOT NULL,
    imageUrl VARCHAR(500),
    status VARCHAR(50) DEFAULT 'DRAFT',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_goods_posts_user_id (userId),
    INDEX idx_goods_posts_status (status),
    INDEX idx_goods_posts_created_at (createdAt)
);

-- Comments 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    postId BIGINT NOT NULL,
    userId BIGINT NOT NULL,
    userEmail VARCHAR(255) NOT NULL,
    userName VARCHAR(255) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES goods_posts(id) ON DELETE CASCADE,
    INDEX idx_comments_post_id (postId),
    INDEX idx_comments_user_id (userId),
    INDEX idx_comments_created_at (createdAt)
);

-- Likes 테이블 생성
CREATE TABLE IF NOT EXISTS likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    postId BIGINT NOT NULL,
    userId BIGINT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES goods_posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_user (postId, userId),
    INDEX idx_likes_post_id (postId),
    INDEX idx_likes_user_id (userId)
); 