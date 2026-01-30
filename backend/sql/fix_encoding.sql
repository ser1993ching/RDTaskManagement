-- 修复 SystemConfigs 表中的中文数据
-- 使用 UTF-8 编码插入正确数据

-- 1. 修复差旅标签
UPDATE SystemConfigs SET ConfigValue = '["市场配合出差","常规项目执行出差","核电项目执行出差","科研出差","改造服务出差","其他任务出差"]'
WHERE ConfigCategory = 'TravelLabels' AND ConfigKey = 'TravelLabels';

-- 2. 修复任务分类
UPDATE SystemConfigs SET ConfigValue = '{"Market":["标书","复询","技术方案","其他"],"Execution":["搭建生产资料","设计院提资","CT配合与提资","随机资料","项目特殊项处理","用户配合","图纸会签","传真回复","其他"],"Nuclear":["核电设计","核安全审查","设备调试","常规岛配合","核岛接口","技术方案","其他"],"ProductDev":["技术方案","设计流程","方案评审","专利申请","出图","图纸改版","设计总结"],"Research":["开题报告","专利申请","结题报告","其他"],"Renovation":["前期项目配合","方案编制","其他"],"MeetingTraining":["学习与培训","党建会议","班务会","设计评审会","资料讨论会","其他"],"AdminParty":["报表填报","ppt汇报","总结报告","其他"],"Travel":["市场配合出差","常规项目执行出差","核电项目执行出差","科研出差","改造服务出差","其他任务出差"],"Other":["通用任务"]}'
WHERE ConfigCategory = 'TaskCategories' AND ConfigKey = 'All';

-- 验证数据
SELECT Id, ConfigCategory, ConfigKey, LEFT(ConfigValue, 100) AS ConfigValuePreview FROM SystemConfigs;
