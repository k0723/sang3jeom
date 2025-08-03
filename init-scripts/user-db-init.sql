-- User Service Database Initialization Script
-- Database: user_db

USE user_db;

-- Users 테이블 생성
CREATE TABLE IF NOT EXISTS Users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50),
    providerId VARCHAR(255),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    passwordHash VARCHAR(255),
    roles BOOLEAN NOT NULL DEFAULT FALSE,
    name VARCHAR(255),
    profileImageUrl VARCHAR(500),
    phone VARCHAR(20),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_provider_id (provider, providerId),
    INDEX idx_users_username (username)
);

-- UserAiGoods 테이블 생성
CREATE TABLE IF NOT EXISTS UserAiGoods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    goodsName VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    imageUrl VARCHAR(500),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user_ai_goods_user_id (userId)
);

-- UserAiImage 테이블 생성
CREATE TABLE IF NOT EXISTS UserAiImage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    imageUrl VARCHAR(500) NOT NULL,
    prompt TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user_ai_image_user_id (userId)
);

-- Email Verifications 테이블 생성
CREATE TABLE IF NOT EXISTS email_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    verification_code VARCHAR(10) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_count INT NOT NULL DEFAULT 0,
    INDEX idx_email_verifications_email (email),
    INDEX idx_email_verifications_expires_at (expires_at)
);

-- 초기 관리자 계정 생성 (선택사항)
-- INSERT INTO Users (username, email, passwordHash, roles, name, createdAt) 
-- VALUES ('admin', 'admin@sang3jeom.com', '$2a$10$...', TRUE, '관리자', NOW()); 