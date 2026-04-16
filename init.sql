-- 初始化数据库
CREATE DATABASE IF NOT EXISTS donot_listen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE donot_listen;

-- 创建应用用户（如果需要）
-- CREATE USER IF NOT EXISTS 'donotlisten'@'%' IDENTIFIED BY 'donotlisten123';
-- GRANT ALL PRIVILEGES ON donot_listen.* TO 'donotlisten'@'%';
-- FLUSH PRIVILEGES;

-- 设置默认字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
