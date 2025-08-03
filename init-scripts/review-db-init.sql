-- Review Service Database Initialization Script
-- Database: review_db

USE review_db;

-- Reviews 테이블 생성
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    imageUrl VARCHAR(2048),
    rating DOUBLE NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
    userId BIGINT NOT NULL,
    orderId BIGINT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reviews_user_id (userId),
    INDEX idx_reviews_order_id (orderId),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_created_at (createdAt)
);

-- Review Statistics 테이블 (선택사항 - 성능 최적화용)
CREATE TABLE IF NOT EXISTS review_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    goodsId BIGINT NOT NULL,
    averageRating DOUBLE DEFAULT 0.0,
    totalReviews INT DEFAULT 0,
    fiveStarCount INT DEFAULT 0,
    fourStarCount INT DEFAULT 0,
    threeStarCount INT DEFAULT 0,
    twoStarCount INT DEFAULT 0,
    oneStarCount INT DEFAULT 0,
    lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_goods_statistics (goodsId),
    INDEX idx_review_statistics_goods_id (goodsId),
    INDEX idx_review_statistics_avg_rating (averageRating)
); 