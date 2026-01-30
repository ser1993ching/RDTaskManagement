-- 创建 SystemConfigs 表
CREATE TABLE IF NOT EXISTS `SystemConfigs` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `ConfigKey` VARCHAR(100) NOT NULL,
    `ConfigCategory` VARCHAR(50) NOT NULL,
    `ConfigValue` TEXT NOT NULL,
    `Description` VARCHAR(500) NULL,
    `IsDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NULL,
    UNIQUE INDEX `IX_SystemConfigs_Category_Key` (`ConfigCategory`, `ConfigKey`),
    INDEX `IX_SystemConfigs_Category` (`ConfigCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入迁移记录（告诉EF迁移已应用）
INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260121013853_AddSystemConfigs', '8.0.0')
ON DUPLICATE KEY UPDATE `MigrationId`=`MigrationId`;

-- 初始化默认配置数据
-- 机型配置
INSERT INTO `SystemConfigs` (`ConfigKey`, `ConfigCategory`, `ConfigValue`, `Description`, `CreatedAt`)
SELECT 'EquipmentModels', 'EquipmentModels', '["H300","H380","H420","H480","H550","H620","H700","H800","H900","H1000"]', '机型配置', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `SystemConfigs` WHERE `ConfigCategory` = 'EquipmentModels' AND `ConfigKey` = 'EquipmentModels');

-- 容量等级配置
INSERT INTO `SystemConfigs` (`ConfigKey`, `ConfigCategory`, `ConfigValue`, `Description`, `CreatedAt`)
SELECT 'CapacityLevels', 'CapacityLevels', '["100MW","150MW","200MW","250MW","300MW","350MW","400MW","500MW","600MW","700MW"]', '容量等级配置', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `SystemConfigs` WHERE `ConfigCategory` = 'CapacityLevels' AND `ConfigKey` = 'CapacityLevels');

-- 差旅标签配置
INSERT INTO `SystemConfigs` (`ConfigKey`, `ConfigCategory`, `ConfigValue`, `Description`, `CreatedAt`)
SELECT 'TravelLabels', 'TravelLabels', '["市场配合出差","常规项目执行出差","核电项目执行出差","科研出差","改造服务出差","其他任务出差"]', '差旅标签配置', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `SystemConfigs` WHERE `ConfigCategory` = 'TravelLabels' AND `ConfigKey` = 'TravelLabels');

-- 任务分类配置
INSERT INTO `SystemConfigs` (`ConfigKey`, `ConfigCategory`, `ConfigValue`, `Description`, `CreatedAt`)
SELECT 'All', 'TaskCategories', '{"Market":["标书","复询","技术方案","其他"],"Execution":["搭建生产资料","设计院提资","CT配合与提资","随机资料","项目特殊项处理","用户配合","图纸会签","传真回复","其他"],"Nuclear":["核电设计","核安全审查","设备调试","常规岛配合","核岛接口","技术方案","其他"],"ProductDev":["技术方案","设计流程","方案评审","专利申请","出图","图纸改版","设计总结"],"Research":["开题报告","专利申请","结题报告","其他"],"Renovation":["前期项目配合","方案编制","其他"],"MeetingTraining":["学习与培训","党建会议","班务会","设计评审会","资料讨论会","其他"],"AdminParty":["报表填报","ppt汇报","总结报告","其他"],"Travel":["市场配合出差","常规项目执行出差","核电项目执行出差","科研出差","改造服务出差","其他任务出差"],"Other":["通用任务"]}', '任务子分类配置', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `SystemConfigs` WHERE `ConfigCategory` = 'TaskCategories' AND `ConfigKey` = 'All');

SELECT * FROM `SystemConfigs`;
