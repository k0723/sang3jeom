-- Order Service Database Initialization Script
-- Database: order_db

USE order_db;

-- Orders 테이블 생성
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    address TEXT,
    memo TEXT,
    userName VARCHAR(255),
    price BIGINT DEFAULT 0,
    quantity INT DEFAULT 1,
    goodsId BIGINT,
    goodsName VARCHAR(255),
    INDEX idx_orders_user_id (userId),
    INDEX idx_orders_status (status),
    INDEX idx_orders_order_date (orderDate),
    INDEX idx_orders_goods_id (goodsId)
);

-- Order Items 테이블 생성 (향후 확장용)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT NOT NULL,
    goodsId BIGINT NOT NULL,
    goodsName VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price BIGINT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_items_order_id (orderId),
    INDEX idx_order_items_goods_id (goodsId)
);

-- Payment 정보 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    transactionId VARCHAR(255),
    paidAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payments_order_id (orderId),
    INDEX idx_payments_status (status),
    INDEX idx_payments_transaction_id (transactionId)
); 