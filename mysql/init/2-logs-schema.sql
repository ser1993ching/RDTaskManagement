-- 日志数据库 Schema
CREATE DATABASE IF NOT EXISTS TaskManageSystem_Logs DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE TaskManageSystem_Logs;

-- API 日志表
CREATE TABLE IF NOT EXISTS api_logs (
    Id BIGINT AUTO_INCREMENT PRIMARY KEY,
    RequestId VARCHAR(64) NOT NULL,
    UserId VARCHAR(64),
    Method VARCHAR(16) NOT NULL,
    Path VARCHAR(512) NOT NULL,
    QueryString VARCHAR(1024),
    RequestBody VARCHAR(2000),
    StatusCode INT NOT NULL,
    StatusInfo VARCHAR(32),
    IsSuccess BOOLEAN NOT NULL,
    ElapsedMilliseconds BIGINT NOT NULL,
    ClientIp VARCHAR(64),
    UserAgent VARCHAR(512),
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_requestid (RequestId),
    INDEX idx_userid (UserId),
    INDEX idx_path (Path),
    INDEX idx_createdat (CreatedAt),
    INDEX idx_issuccess (IsSuccess),
    INDEX idx_statuscode (StatusCode),
    INDEX idx_createdat_issuccess (CreatedAt, IsSuccess)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
