-- 主数据库 Schema
CREATE DATABASE IF NOT EXISTS TaskManageSystem DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE TaskManageSystem;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    UserID VARCHAR(64) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    SystemRole NVARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    OfficeLocation NVARCHAR(50),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    JoinDate DATE,
    Title NVARCHAR(100),
    Education NVARCHAR(50),
    Phone NVARCHAR(20),
    Email NVARCHAR(255),
    AvatarUrl NVARCHAR(500),
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_userid (UserID),
    INDEX idx_name (Name),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务类别表
CREATE TABLE IF NOT EXISTS task_classes (
    ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    TaskClassID VARCHAR(10) NOT NULL UNIQUE,
    ClassName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    CategoryCode NVARCHAR(50) NOT NULL,
    SortOrder INT DEFAULT 0,
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_taskclassid (TaskClassID),
    INDEX idx_categorycode (CategoryCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
    ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    ProjectID VARCHAR(64) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Description NVARCHAR(1000),
    StartDate DATE,
    EndDate DATE,
    Status NVARCHAR(20) NOT NULL DEFAULT '进行中',
    ProjectManager NVARCHAR(64),
    CustomerName NVARCHAR(200),
    Priority INT DEFAULT 0,
    IsWon BOOLEAN,
    IsForeign BOOLEAN,
    CapacityLevel NVARCHAR(50),
    Model NVARCHAR(100),
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_projectid (ProjectID),
    INDEX idx_category (Category),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    TaskID VARCHAR(64) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000),
    TaskClassID VARCHAR(10) NOT NULL,
    ProjectID VARCHAR(64),
    TaskStatus NVARCHAR(20) NOT NULL DEFAULT '待开始',
    Priority INT DEFAULT 0,
    Workload FLOAT DEFAULT 0,
    Difficulty NVARCHAR(20),
    Assignee NVARCHAR(64),
    Creator NVARCHAR(64) NOT NULL,
    StartDate DATE,
    EndDate DATE,
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsCompleted BOOLEAN DEFAULT FALSE,
    CompletionDate DATE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- 审核相关
    Checker NVARCHAR(64),
    CheckerStatus NVARCHAR(20),
    ChiefDesigner NVARCHAR(64),
    ChiefDesignerStatus NVARCHAR(20),
    Approver NVARCHAR(64),
    ApproverStatus NVARCHAR(20),
    AssigneeStatus NVARCHAR(20),
    -- 差旅任务字段
    TravelLocation NVARCHAR(200),
    TravelDuration INT,
    TravelLabel NVARCHAR(50),
    -- 会议任务字段
    MeetingDuration FLOAT,
    Participants NVARCHAR(1000),
    ParticipantNames NVARCHAR(1000),
    -- 外部人员
    ExternalAssignee NVARCHAR(200),
    ExternalAssigneeContact NVARCHAR(200),
    INDEX idx_taskid (TaskID),
    INDEX idx_taskclassid (TaskClassID),
    INDEX idx_projectid (ProjectID),
    INDEX idx_status (TaskStatus),
    INDEX idx_assignee (Assignee),
    INDEX idx_creator (Creator)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务池表
CREATE TABLE IF NOT EXISTS task_pool (
    ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    TaskID VARCHAR(64) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000),
    TaskClassID VARCHAR(10) NOT NULL,
    Priority INT DEFAULT 0,
    Workload FLOAT DEFAULT 0,
    Difficulty NVARCHAR(20),
    Creator NVARCHAR(64) NOT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_taskid (TaskID),
    INDEX idx_taskclassid (TaskClassID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认管理员用户
INSERT INTO users (UserID, Name, Password, SystemRole, OfficeLocation, Status, JoinDate, Title, Education)
VALUES
    ('admin', '管理员', 'admin', 'ADMIN', '总部', 'Active', '2024-01-01', '系统管理员', '本科'),
    ('zhangzu', '张组长', '123', 'LEADER', '总部', 'Active', '2024-01-01', '组长', '硕士')
ON DUPLICATE KEY UPDATE Name=VALUES(Name);

-- 插入默认任务类别
INSERT INTO task_classes (TaskClassID, ClassName, Description, CategoryCode, SortOrder)
VALUES
    ('TC001', '市场配合', '市场配合类任务', 'MARKET', 1),
    ('TC002', '常规项目', '常规项目执行', 'EXECUTION', 2),
    ('TC003', '核电项目', '核电项目相关', 'NUCLEAR', 3),
    ('TC004', '产品研发', '产品研发工作', 'PRODUCT_DEV', 4),
    ('TC005', '科研项目', '科研项目研究', 'RESEARCH', 5),
    ('TC006', '改造项目', '改造项目执行', 'RENOVATION', 6),
    ('TC007', '会议培训', '会议与培训活动', 'MEETING_TRAINING', 7),
    ('TC008', '行政与党建', '行政与党建工作', 'ADMIN_PARTY', 8),
    ('TC009', '差旅任务', '出差相关任务', 'TRAVEL', 9),
    ('TC010', '其他', '其他类型任务', 'OTHER', 10);
