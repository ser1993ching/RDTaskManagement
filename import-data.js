/**
 * 热电专业示例数据导入脚本
 * 通过API将数据导入系统数据库
 *
 * 使用方法: node import-data.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

// 读取人员清单
const personnelList = [
    { id: '1004889', name: '胡德剑', role: '组员', location: '成都', title: '正高级主任工程师' },
    { id: '1005184', name: '官永胜', role: '组员', location: '成都', title: '主任工程师' },
    { id: '1006279', name: '李朝科', role: '组员', location: '成都', title: '主任工程师' },
    { id: '1007204', name: '王建立', role: '组员', location: '成都', title: '副主任工程师' },
    { id: '1007241', name: '张玮', role: '组员', location: '德阳', title: '高级工程师' },
    { id: '1007465', name: '王黔', role: '组员', location: '德阳', title: '副主任工程师' },
    { id: '1007690', name: '金媛媛', role: '组员', location: '成都', title: '副主任工程师' },
    { id: '1008072', name: '卢永尧', role: '组员', location: '成都', title: '副主任工程师' },
    { id: '1008344', name: '陈增芬', role: '组员', location: '成都', title: '高级工程师' },
    { id: '1008513', name: '孙青', role: '组员', location: '德阳', title: '高级工程师' },
    { id: '3001226', name: '李又超', role: '班组长', location: '成都', title: '副主任工程师' },
    { id: '3002681', name: '杨迪', role: '组员', location: '德阳', title: '高级工程师' },
    { id: '3002684', name: '古曦', role: '班组长', location: '德阳', title: '高级工程师' },
    { id: '3002865', name: '钟德富', role: '班组长', location: '德阳', title: '高级工程师' },
    { id: '3003407', name: '廖亨友', role: '组员', location: '成都', title: '高级工程师' },
    { id: '3004412', name: '蒋群雄', role: '组员', location: '德阳', title: '高级工程师' },
    { id: '3005901', name: '王雅雯', role: '组员', location: '成都', title: '工程师' },
    { id: '3005905', name: '曹驰健', role: '组员', location: '德阳', title: '工程师' },
    { id: '3005922', name: '王鸿', role: '班组长', location: '成都', title: '工程师' },
    { id: '3005925', name: '杨巍', role: '班组长', location: '成都', title: '工程师' },
    { id: '3006612', name: '黄鑫', role: '组员', location: '德阳', title: '工程师' },
    { id: '3007213', name: '王可欣', role: '组员', location: '德阳', title: '工程师' },
    { id: '3007227', name: '苏文博', role: '组员', location: '成都', title: '工程师' },
    { id: '3008172', name: '樊嘉豪', role: '组员', location: '成都', title: '工程师' },
    { id: '3008231', name: '李典', role: '组员', location: '成都', title: '工程师' },
    { id: '3009101', name: '刘林涵', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3010363', name: '刘咏芳', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3010758', name: '魏宇航', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3010862', name: '贺向东', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3012527', name: '杨飞越', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3012524', name: '徐青青', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3012478', name: '牟星宇', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3012451', name: '郑典涛', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3012535', name: '盛晋银', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3014242', name: '罗欢', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3014388', name: '郑淇文', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3014531', name: '杨攀', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3014253', name: '黄泽奇', role: '组员', location: '成都', title: '助理工程师' },
    { id: '3014229', name: '曾一涛', role: '组员', location: '成都', title: '助理工程师' },
];

// 项目数据 - 移除自定义ID，让后端自动生成
const projects = [
    // 市场配合项目
    { name: '印尼某电厂350MW汽轮发电机投标项目', category: 'Market', capacity: '350MW', model: '汽轮发电机', isWon: true, isForeign: true },
    { name: '越南海防600MW燃气轮发电机技术方案', category: 'Market', capacity: '600MW', model: '燃气轮发电机', isWon: false, isForeign: true },
    { name: '巴基斯坦核电860MW发电机投标', category: 'Market', capacity: '860MW', model: '核能发电机', isWon: true, isForeign: true },
    { name: '孟加拉国400MW联合循环电厂投标', category: 'Market', capacity: '400MW', model: '燃气轮发电机', isWon: false, isForeign: true },
    { name: '国内某电厂1000MW超超临界机组投标', category: 'Market', capacity: '1000MW', model: '汽轮发电机', isWon: true, isForeign: false },
    // 常规项目执行
    { name: '华能某电厂660MW汽轮发电机改造', category: 'Execution', capacity: '660MW', model: '汽轮发电机', isCommissioned: false },
    { name: '国电某电厂500MW燃气轮机更换项目', category: 'Execution', capacity: '500MW', model: '燃气轮发电机', isCommissioned: false },
    { name: '大唐某电厂300MW发电机增容改造', category: 'Execution', capacity: '300MW', model: '汽轮发电机', isCommissioned: true },
    { name: '华电某电厂850MW超超临界机组', category: 'Execution', capacity: '850MW', model: '汽轮发电机', isCommissioned: false },
    { name: '国电投某电厂600MW燃气轮机发电机组', category: 'Execution', capacity: '600MW', model: '燃气轮发电机', isCommissioned: false },
    // 核电项目执行
    { name: '田湾核电7#机组1000MW发电机设计', category: 'Nuclear', capacity: '1000MW', model: '核能发电机' },
    { name: '昌江核电2#机组650MW发电机配合', category: 'Nuclear', capacity: '650MW', model: '核能发电机' },
    { name: '漳州核电1#机组900MW发电机审图', category: 'Nuclear', capacity: '900MW', model: '核能发电机' },
    { name: '三门核电二期发电机技术澄清', category: 'Nuclear', capacity: '800MW', model: '核能发电机' },
    { name: '海阳核电3#机组750MW设备调试', category: 'Nuclear', capacity: '750MW', model: '核能发电机' },
    // 科研项目
    { name: '1000MW级高效汽轮发电机研发', category: 'Research', capacity: '1000MW', model: '汽轮发电机', isCompleted: false },
    { name: '燃气轮发电机高温绝缘材料研究', category: 'Research', capacity: '600MW', model: '燃气轮发电机', isCompleted: false },
    { name: '核电发电机智能监测系统开发', category: 'Research', capacity: '1000MW', model: '核能发电机', isCompleted: false },
    { name: '发电机定子绕组振动分析研究', category: 'Research', capacity: '500MW', model: '汽轮发电机', isCompleted: false },
    { name: '300MW级模块化发电机设计', category: 'Research', capacity: '300MW', model: '汽轮发电机', isCompleted: false },
];

// 项目ID映射 (后端自动生成，顺序与projects数组一致)
const projectIdMapping = {
    // 市场配合项目 (PRJ001-PRJ005)
    'MKT-001': 'PRJ001',
    'MKT-002': 'PRJ002',
    'MKT-003': 'PRJ003',
    'MKT-004': 'PRJ004',
    'MKT-005': 'PRJ005',
    // 常规项目执行 (PRJ006-PRJ010)
    'PRJ-001': 'PRJ006',
    'PRJ-002': 'PRJ007',
    'PRJ-003': 'PRJ008',
    'PRJ-004': 'PRJ009',
    'PRJ-005': 'PRJ010',
    // 核电项目执行 (PRJ011-PRJ015)
    'NUC-001': 'PRJ011',
    'NUC-002': 'PRJ012',
    'NUC-003': 'PRJ013',
    'NUC-004': 'PRJ014',
    'NUC-005': 'PRJ015',
    // 科研项目 (PRJ016-PRJ020)
    'RD-001': 'PRJ016',
    'RD-002': 'PRJ017',
    'RD-003': 'PRJ018',
    'RD-004': 'PRJ019',
    'RD-005': 'PRJ020'
};

// 任务数据
const tasks = [
    // TC001 市场配合 - 25条
    { taskId: 'T-001', taskName: '印尼350MW发电机技术方案编制', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 120, difficulty: 2.0, startDate: '2024-10-08', dueDate: '2024-11-15', status: '已完成' },
    { taskId: 'T-002', taskName: '印尼350MW发电机报价清单制作', taskClassId: 'TC001', category: '标书', projectId: 'MKT-001', assigneeId: '1007204', checkerId: '3003407', approverId: '3005925', workload: 80, difficulty: 1.5, startDate: '2024-10-10', dueDate: '2024-11-10', status: '已完成' },
    { taskId: 'T-003', taskName: '越南600MW燃气轮发电机方案设计', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-002', assigneeId: '1005184', checkerId: '1007690', approverId: '3001226', workload: 160, difficulty: 2.5, startDate: '2024-10-15', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-004', taskName: '越南600MW燃气轮发电机商务报价', taskClassId: 'TC001', category: '标书', projectId: 'MKT-002', assigneeId: '3009101', checkerId: '1005184', approverId: '3001226', workload: 60, difficulty: 1.5, startDate: '2024-10-20', dueDate: '2024-12-15', status: '已完成' },
    { taskId: 'T-005', taskName: '巴基斯坦860MW核电发电机技术投标', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-003', assigneeId: '1006279', checkerId: '3003407', approverId: '3005925', workload: 200, difficulty: 3.0, startDate: '2024-10-05', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-006', taskName: '巴基斯坦860MW核电发电机设备选型', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-003', assigneeId: '3002681', checkerId: '1006279', approverId: '3002684', workload: 100, difficulty: 2.0, startDate: '2024-10-08', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-007', taskName: '孟加拉400MW燃气轮机复询回复', taskClassId: 'TC001', category: '复询', projectId: 'MKT-004', assigneeId: '1005184', checkerId: '1007690', approverId: '3001226', workload: 40, difficulty: 1.5, startDate: '2024-11-01', dueDate: '2024-11-20', status: '已完成' },
    { taskId: 'T-008', taskName: '孟加拉400MW发电机技术参数确认', taskClassId: 'TC001', category: '复询', projectId: 'MKT-004', assigneeId: '3010758', checkerId: '1005184', approverId: '3001226', workload: 30, difficulty: 1.0, startDate: '2024-11-05', dueDate: '2024-11-15', status: '已完成' },
    { taskId: 'T-009', taskName: '国内1000MW超超临界机组技术方案', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-005', assigneeId: '3003407', checkerId: '1006279', approverId: '3005925', workload: 180, difficulty: 2.5, startDate: '2024-10-20', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-010', taskName: '国内1000MW发电机性能曲线计算', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-005', assigneeId: '1007204', checkerId: '3003407', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-10-25', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-011', taskName: '印尼项目发电机交货期确认函', taskClassId: 'TC001', category: '传真回复', projectId: 'MKT-001', assigneeId: '3004412', checkerId: '3009101', approverId: '3002684', workload: 10, difficulty: 0.5, startDate: '2024-11-15', dueDate: '2024-11-18', status: '已完成' },
    { taskId: 'T-012', taskName: '越南项目用户现场技术答疑', taskClassId: 'TC001', category: '其他', projectId: 'MKT-002', assigneeId: '1005184', checkerId: '3003407', approverId: '3001226', workload: 20, difficulty: 1.0, startDate: '2024-11-20', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-013', taskName: '巴基斯坦核电发电机质量保证书', taskClassId: 'TC001', category: '其他', projectId: 'MKT-003', assigneeId: '1008344', checkerId: '1006279', approverId: '3005925', workload: 40, difficulty: 1.5, startDate: '2024-11-10', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-014', taskName: '孟加拉项目发电机技术澄清', taskClassId: 'TC001', category: '复询', projectId: 'MKT-004', assigneeId: '1007690', checkerId: '1005184', approverId: '3001226', workload: 50, difficulty: 1.5, startDate: '2024-11-25', dueDate: '2024-12-05', status: '已完成' },
    { taskId: 'T-015', taskName: '国内项目发电机备品备件清单', taskClassId: 'TC001', category: '标书', projectId: 'MKT-005', assigneeId: '3009101', checkerId: '1007204', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-11-20', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-016', taskName: '印尼发电机项目用户培训方案', taskClassId: 'TC001', category: '其他', projectId: 'MKT-001', assigneeId: '3003407', checkerId: '1006279', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-12-01', dueDate: '2024-12-15', status: '已完成' },
    { taskId: 'T-017', taskName: '越南燃气轮发电机振动分析报告', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-002', assigneeId: '3004412', checkerId: '1007690', approverId: '3002684', workload: 80, difficulty: 2.0, startDate: '2024-12-05', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-018', taskName: '巴基斯坦核电发电机型式试验大纲', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-003', assigneeId: '1006279', checkerId: '3003407', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-12-01', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-019', taskName: '孟加拉项目发电机运输方案', taskClassId: 'TC001', category: '其他', projectId: 'MKT-004', assigneeId: '3010758', checkerId: '1005184', approverId: '3001226', workload: 40, difficulty: 1.0, startDate: '2024-12-10', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-020', taskName: '国内1000MW发电机监造方案', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-005', assigneeId: '1008344', checkerId: '1006279', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-12-05', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-021', taskName: '印尼项目发电机安装指导书初稿', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-001', assigneeId: '3003407', checkerId: '1007204', approverId: '3005925', workload: 70, difficulty: 2.0, startDate: '2024-12-15', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-022', taskName: '越南燃气轮发电机冷却系统计算', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-002', assigneeId: '1008072', checkerId: '3004412', approverId: '3002684', workload: 90, difficulty: 2.0, startDate: '2024-12-18', dueDate: '2025-01-10', status: '已完成' },
    { taskId: 'T-023', taskName: '巴基斯坦核电发电机绝缘系统设计', taskClassId: 'TC001', category: '技术方案', projectId: 'MKT-003', assigneeId: '1007690', checkerId: '1006279', approverId: '3005925', workload: 120, difficulty: 2.5, startDate: '2024-12-20', dueDate: '2025-01-15', status: '已完成' },
    { taskId: 'T-024', taskName: '孟加拉项目发电机调试大纲', taskClassId: 'TC001', category: '其他', projectId: 'MKT-004', assigneeId: '3010758', checkerId: '1007204', approverId: '3001226', workload: 50, difficulty: 1.5, startDate: '2024-12-22', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-025', taskName: '国内项目发电机设计联络会纪要', taskClassId: 'TC001', category: '其他', projectId: 'MKT-005', assigneeId: '3004412', checkerId: '3003407', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-12-28', dueDate: '2025-01-03', status: '已完成' },

    // TC002 常规项目执行 - 40条
    { taskId: 'T-026', taskName: '660MW汽轮发电机总装图设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 200, difficulty: 3.0, startDate: '2024-10-08', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-027', taskName: '660MW发电机定子绕组设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-001', assigneeId: '1007204', checkerId: '3003407', approverId: '3005925', workload: 150, difficulty: 2.5, startDate: '2024-10-10', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-028', taskName: '660MW发电机转子设计计算', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-001', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 180, difficulty: 2.5, startDate: '2024-10-12', dueDate: '2024-12-05', status: '已完成' },
    { taskId: 'T-029', taskName: '660MW发电机冷却系统设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-001', assigneeId: '1008072', checkerId: '3003407', approverId: '3005925', workload: 120, difficulty: 2.0, startDate: '2024-10-15', dueDate: '2024-11-20', status: '已完成' },
    { taskId: 'T-030', taskName: '660MW发电机轴系扭振分析', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-001', assigneeId: '1005184', checkerId: '1007204', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-10-18', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-031', taskName: '500MW燃气轮发电机基础图', taskClassId: 'TC002', category: '随机资料', projectId: 'PRJ-002', assigneeId: '3003407', checkerId: '3004412', approverId: '3002684', workload: 80, difficulty: 1.5, startDate: '2024-10-20', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-032', taskName: '500MW燃气轮发电机安装手册', taskClassId: 'TC002', category: '随机资料', projectId: 'PRJ-002', assigneeId: '3010758', checkerId: '3003407', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-10-22', dueDate: '2024-12-01', status: '已完成' },
    { taskId: 'T-033', taskName: '500MW发电机出厂试验大纲', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-002', assigneeId: '1008344', checkerId: '1006279', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-10-25', dueDate: '2024-11-15', status: '已完成' },
    { taskId: 'T-034', taskName: '500MW发电机用户验收标准', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-002', assigneeId: '1006279', checkerId: '3003407', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-10-28', dueDate: '2024-11-20', status: '已完成' },
    { taskId: 'T-035', taskName: '300MW发电机增容方案论证', taskClassId: 'TC002', category: '方案编制', projectId: 'PRJ-003', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-10-05', dueDate: '2024-10-25', status: '已完成' },
    { taskId: 'T-036', taskName: '300MW发电机增容转子设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-003', assigneeId: '3004412', checkerId: '1007204', approverId: '3002684', workload: 140, difficulty: 2.5, startDate: '2024-10-08', dueDate: '2024-11-10', status: '已完成' },
    { taskId: 'T-037', taskName: '300MW发电机增容定子改造', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-003', assigneeId: '1008072', checkerId: '3003407', approverId: '3005925', workload: 160, difficulty: 2.5, startDate: '2024-10-10', dueDate: '2024-11-15', status: '已完成' },
    { taskId: 'T-038', taskName: '300MW发电机增容励磁系统', taskClassId: 'TC002', category: 'CT配合与提资', projectId: 'PRJ-003', assigneeId: '1005184', checkerId: '3004412', approverId: '3002684', workload: 80, difficulty: 1.5, startDate: '2024-10-12', dueDate: '2024-11-05', status: '已完成' },
    { taskId: 'T-039', taskName: '300MW发电机增容联调试验', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-003', assigneeId: '1008344', checkerId: '3003407', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-10-15', dueDate: '2024-11-20', status: '已完成' },
    { taskId: 'T-040', taskName: '850MW超超临界发电机方案设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-004', assigneeId: '3003407', checkerId: '1006279', approverId: '3005925', workload: 220, difficulty: 3.0, startDate: '2024-10-20', dueDate: '2024-12-15', status: '已完成' },
    { taskId: 'T-041', taskName: '850MW发电机电磁计算', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-004', assigneeId: '1007204', checkerId: '3003407', approverId: '3005925', workload: 180, difficulty: 2.5, startDate: '2024-10-22', dueDate: '2024-12-01', status: '已完成' },
    { taskId: 'T-042', taskName: '850MW发电机机械设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-004', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 200, difficulty: 2.5, startDate: '2024-10-25', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-043', taskName: '850MW发电机通风设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-004', assigneeId: '1008072', checkerId: '1007204', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-10-28', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-044', taskName: '850MW发电机绝缘系统设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-004', assigneeId: '3009101', checkerId: '3003407', approverId: '3005925', workload: 120, difficulty: 2.0, startDate: '2024-11-01', dueDate: '2024-12-05', status: '已完成' },
    { taskId: 'T-045', taskName: '600MW燃气轮发电机机座设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-005', assigneeId: '3003407', checkerId: '3004412', approverId: '3002684', workload: 140, difficulty: 2.0, startDate: '2024-11-05', dueDate: '2024-12-15', status: '已完成' },
    { taskId: 'T-046', taskName: '600MW燃气轮发电机端盖设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-005', assigneeId: '1005184', checkerId: '1008072', approverId: '3001226', workload: 100, difficulty: 1.5, startDate: '2024-11-08', dueDate: '2024-12-01', status: '已完成' },
    { taskId: 'T-047', taskName: '600MW燃气轮发电机轴承设计', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-005', assigneeId: '1006279', checkerId: '3003407', approverId: '3005925', workload: 120, difficulty: 2.0, startDate: '2024-11-10', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-048', taskName: '660MW发电机图纸会签', taskClassId: 'TC002', category: '图纸会签', projectId: 'PRJ-001', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 40, difficulty: 1.0, startDate: '2024-11-20', dueDate: '2024-12-05', status: '已完成' },
    { taskId: 'T-049', taskName: '500MW发电机用户现场服务', taskClassId: 'TC002', category: '用户配合', projectId: 'PRJ-002', assigneeId: '3010758', checkerId: '3003407', approverId: '3005925', workload: 80, difficulty: 1.5, startDate: '2024-11-22', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-050', taskName: '300MW发电机增容验收报告', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-003', assigneeId: '1008344', checkerId: '1007204', approverId: '3005925', workload: 50, difficulty: 1.0, startDate: '2024-11-25', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-051', taskName: '850MW发电机技术条件书', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-004', assigneeId: '3003407', checkerId: '1006279', approverId: '3005925', workload: 80, difficulty: 1.5, startDate: '2024-12-01', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-052', taskName: '600MW燃气轮发电机试验大纲', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-005', assigneeId: '1008072', checkerId: '3004412', approverId: '3002684', workload: 60, difficulty: 1.5, startDate: '2024-12-03', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-053', taskName: '660MW发电机出厂验收试验', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-001', assigneeId: '1008344', checkerId: '3003407', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-12-05', dueDate: '2025-01-10', status: '已完成' },
    { taskId: 'T-054', taskName: '500MW发电机现场安装指导', taskClassId: 'TC002', category: '用户配合', projectId: 'PRJ-002', assigneeId: '3010758', checkerId: '1005184', approverId: '3001226', workload: 70, difficulty: 1.5, startDate: '2024-12-08', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-055', taskName: '300MW发电机运行培训', taskClassId: 'TC002', category: '用户配合', projectId: 'PRJ-003', assigneeId: '3004412', checkerId: '3003407', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-12-10', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-056', taskName: '850MW发电机设计评审', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-004', assigneeId: '3003407', checkerId: '1006279', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-12-12', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-057', taskName: '600MW燃气轮发电机FAT测试', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-005', assigneeId: '1006279', checkerId: '1008072', approverId: '3002684', workload: 80, difficulty: 1.5, startDate: '2024-12-15', dueDate: '2025-01-10', status: '已完成' },
    { taskId: 'T-058', taskName: '660MW发电机技术协议签订', taskClassId: 'TC002', category: '设计院提资', projectId: 'PRJ-001', assigneeId: '3003407', checkerId: '3005925', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-12-18', dueDate: '2024-12-28', status: '已完成' },
    { taskId: 'T-059', taskName: '500MW发电机备品备件清单', taskClassId: 'TC002', category: '随机资料', projectId: 'PRJ-002', assigneeId: '3010758', checkerId: '1007204', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-12-20', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-060', taskName: '300MW发电机改造总结报告', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-003', assigneeId: '1005184', checkerId: '3003407', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-12-22', dueDate: '2025-01-08', status: '已完成' },
    { taskId: 'T-061', taskName: '850MW发电机生产进度跟踪', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-004', assigneeId: '1008513', checkerId: '3004412', approverId: '3002684', workload: 60, difficulty: 1.0, startDate: '2024-12-25', dueDate: '2025-01-20', status: '已完成' },
    { taskId: 'T-062', taskName: '600MW发电机质量检验计划', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-005', assigneeId: '1008344', checkerId: '3003407', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-12-28', dueDate: '2025-01-10', status: '已完成' },
    { taskId: 'T-063', taskName: '660MW发电机最终验收报告', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-001', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 50, difficulty: 1.5, startDate: '2025-01-02', dueDate: '2025-01-15', status: '已完成' },
    { taskId: 'T-064', taskName: '500MW发电机性能验收试验', taskClassId: 'TC002', category: '项目特殊项处理', projectId: 'PRJ-002', assigneeId: '1006279', checkerId: '3003407', approverId: '3005925', workload: 80, difficulty: 2.0, startDate: '2025-01-05', dueDate: '2025-01-18', status: '已完成' },
    { taskId: 'T-065', taskName: '300MW发电机项目收尾工作', taskClassId: 'TC002', category: '其他', projectId: 'PRJ-003', assigneeId: '3010758', checkerId: '1008072', approverId: '3002684', workload: 30, difficulty: 1.0, startDate: '2025-01-08', dueDate: '2025-01-15', status: '已完成' },
];

// 继续添加更多任务数据（TC003-TC010）
const tasksContinued = [
    // TC003 核电项目执行 - 35条
    { taskId: 'T-066', taskName: '1000MW核电发电机总体设计', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-001', assigneeId: '3003407', checkerId: '1006279', approverId: '3005925', workload: 300, difficulty: 3.0, startDate: '2024-10-08', dueDate: '2024-12-30', status: '已完成' },
    { taskId: 'T-067', taskName: '1000MW核电发电机电磁设计', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-001', assigneeId: '1007204', checkerId: '3003407', approverId: '3005925', workload: 250, difficulty: 3.0, startDate: '2024-10-10', dueDate: '2024-12-15', status: '已完成' },
    { taskId: 'T-068', taskName: '1000MW核电发电机机械设计', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-001', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 280, difficulty: 3.0, startDate: '2024-10-12', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-069', taskName: '1000MW核电发电机绝缘设计', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-001', assigneeId: '1007690', checkerId: '1007204', approverId: '3005925', workload: 200, difficulty: 2.5, startDate: '2024-10-15', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-070', taskName: '1000MW核电发电机通风设计', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-001', assigneeId: '3009101', checkerId: '3003407', approverId: '3005925', workload: 150, difficulty: 2.0, startDate: '2024-10-18', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-071', taskName: '650MW玲龙一号发电机设计', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-002', assigneeId: '3003407', checkerId: '1006279', approverId: '3002684', workload: 260, difficulty: 3.0, startDate: '2024-10-20', dueDate: '2025-01-10', status: '已完成' },
    { taskId: 'T-072', taskName: '650MW发电机定子设计', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-002', assigneeId: '1006279', checkerId: '3003407', approverId: '3005925', workload: 180, difficulty: 2.5, startDate: '2024-10-22', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-073', taskName: '650MW发电机转子设计', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-002', assigneeId: '3004412', checkerId: '1008072', approverId: '3002684', workload: 200, difficulty: 2.5, startDate: '2024-10-25', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-074', taskName: '900MW华龙一号发电机审图', taskClassId: 'TC003', category: '核安全审查', projectId: 'NUC-003', assigneeId: '1005184', checkerId: '3003407', approverId: '3005925', workload: 150, difficulty: 2.5, startDate: '2024-10-28', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-075', taskName: '900MW发电机设计变更审查', taskClassId: 'TC003', category: '核安全审查', projectId: 'NUC-003', assigneeId: '1006279', checkerId: '1005184', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-11-01', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-076', taskName: '800MW AP1000技术澄清', taskClassId: 'TC003', category: '技术方案', projectId: 'NUC-004', assigneeId: '3003407', checkerId: '3004412', approverId: '3002684', workload: 120, difficulty: 2.0, startDate: '2024-11-05', dueDate: '2024-12-05', status: '已完成' },
    { taskId: 'T-077', taskName: '800MW发电机设计接口文件', taskClassId: 'TC003', category: '核岛接口', projectId: 'NUC-004', assigneeId: '3010758', checkerId: '1008072', approverId: '3002684', workload: 80, difficulty: 1.5, startDate: '2024-11-08', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-078', taskName: '750MW CAP1400设备调试', taskClassId: 'TC003', category: '设备调试', projectId: 'NUC-005', assigneeId: '1008344', checkerId: '3003407', approverId: '3005925', workload: 200, difficulty: 2.5, startDate: '2024-11-10', dueDate: '2025-01-15', status: '已完成' },
    { taskId: 'T-079', taskName: '750MW发电机现场调试方案', taskClassId: 'TC003', category: '设备调试', projectId: 'NUC-005', assigneeId: '1005184', checkerId: '1007204', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-11-12', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-080', taskName: '750MW发电机调试大纲', taskClassId: 'TC003', category: '设备调试', projectId: 'NUC-005', assigneeId: '3004412', checkerId: '3003407', approverId: '3002684', workload: 80, difficulty: 1.5, startDate: '2024-11-15', dueDate: '2024-12-15', status: '已完成' },
    { taskId: 'T-081', taskName: '1000MW发电机核安全文化培训', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-001', assigneeId: '3003407', checkerId: '3005925', approverId: '3005925', workload: 20, difficulty: 1.0, startDate: '2024-11-20', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-082', taskName: '650MW发电机质量计划审批', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-002', assigneeId: '1008344', checkerId: '3003407', approverId: '3002684', workload: 60, difficulty: 1.5, startDate: '2024-11-22', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-083', taskName: '900MW发电机核安全审评文件', taskClassId: 'TC003', category: '核安全审查', projectId: 'NUC-003', assigneeId: '1006279', checkerId: '1005184', approverId: '3005925', workload: 180, difficulty: 2.5, startDate: '2024-11-25', dueDate: '2024-12-30', status: '已完成' },
    { taskId: 'T-084', taskName: '800MW发电机设备规范书', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-004', assigneeId: '3003407', checkerId: '3004412', approverId: '3002684', workload: 100, difficulty: 2.0, startDate: '2024-11-28', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-085', taskName: '750MW发电机调试试验程序', taskClassId: 'TC003', category: '设备调试', projectId: 'NUC-005', assigneeId: '3010758', checkerId: '1008072', approverId: '3002684', workload: 120, difficulty: 2.0, startDate: '2024-12-01', dueDate: '2024-12-30', status: '已完成' },
    { taskId: 'T-086', taskName: '1000MW发电机抗地震分析', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-001', assigneeId: '1005184', checkerId: '3003407', approverId: '3005925', workload: 150, difficulty: 2.5, startDate: '2024-12-03', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-087', taskName: '650MW发电机屏蔽层设计', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-002', assigneeId: '1006279', checkerId: '3004412', approverId: '3002684', workload: 100, difficulty: 2.0, startDate: '2024-12-05', dueDate: '2024-12-28', status: '已完成' },
    { taskId: 'T-088', taskName: '900MW发电机役前检查方案', taskClassId: 'TC003', category: '核安全审查', projectId: 'NUC-003', assigneeId: '1008072', checkerId: '3003407', approverId: '3005925', workload: 80, difficulty: 1.5, startDate: '2024-12-08', dueDate: '2025-01-03', status: '已完成' },
    { taskId: 'T-089', taskName: '800MW发电机招标文件回复', taskClassId: 'TC003', category: '技术方案', projectId: 'NUC-004', assigneeId: '3003407', checkerId: '1006279', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-12-10', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-090', taskName: '750MW发电机冷态调试', taskClassId: 'TC003', category: '设备调试', projectId: 'NUC-005', assigneeId: '1008344', checkerId: '1007204', approverId: '3005925', workload: 160, difficulty: 2.0, startDate: '2024-12-12', dueDate: '2025-01-12', status: '已完成' },
    { taskId: 'T-091', taskName: '1000MW发电机热态调试', taskClassId: 'TC003', category: '设备调试', projectId: 'NUC-005', assigneeId: '1005184', checkerId: '3003407', approverId: '3005925', workload: 180, difficulty: 2.5, startDate: '2024-12-15', dueDate: '2025-01-18', status: '已完成' },
    { taskId: 'T-092', taskName: '650MW发电机最终验收', taskClassId: 'TC003', category: '设备调试', projectId: 'NUC-002', assigneeId: '3004412', checkerId: '1008072', approverId: '3002684', workload: 60, difficulty: 1.5, startDate: '2024-12-18', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-093', taskName: '900MW发电机设计验证报告', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-003', assigneeId: '3010758', checkerId: '3003407', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-12-20', dueDate: '2025-01-10', status: '已完成' },
    { taskId: 'T-094', taskName: '800MW发电机技术规格书', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-004', assigneeId: '3003407', checkerId: '1006279', approverId: '3005925', workload: 120, difficulty: 2.0, startDate: '2024-12-22', dueDate: '2025-01-08', status: '已完成' },
    { taskId: 'T-095', taskName: '750MW发电机性能试验', taskClassId: 'TC003', category: '设备调试', projectId: 'NUC-005', assigneeId: '1006279', checkerId: '3004412', approverId: '3002684', workload: 140, difficulty: 2.5, startDate: '2024-12-25', dueDate: '2025-01-15', status: '已完成' },
    { taskId: 'T-096', taskName: '1000MW发电机可靠性分析', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-001', assigneeId: '1008072', checkerId: '3003407', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-12-28', dueDate: '2025-01-12', status: '已完成' },
    { taskId: 'T-097', taskName: '650MW发电机设计总结', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-002', assigneeId: '3003407', checkerId: '1006279', approverId: '3005925', workload: 80, difficulty: 1.5, startDate: '2025-01-02', dueDate: '2025-01-15', status: '已完成' },
    { taskId: 'T-098', taskName: '900MW发电机项目归档', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-003', assigneeId: '3010758', checkerId: '1007204', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2025-01-05', dueDate: '2025-01-12', status: '已完成' },
    { taskId: 'T-099', taskName: '800MW发电机进度报告', taskClassId: 'TC003', category: '核电设计', projectId: 'NUC-004', assigneeId: '3004412', checkerId: '3003407', approverId: '3002684', workload: 30, difficulty: 1.0, startDate: '2025-01-08', dueDate: '2025-01-15', status: '已完成' },
    { taskId: 'T-100', taskName: '750MW发电机调试总结', taskClassId: 'TC003', category: '设备调试', projectId: 'NUC-005', assigneeId: '1005184', checkerId: '1008072', approverId: '3002684', workload: 60, difficulty: 1.5, startDate: '2025-01-10', dueDate: '2025-01-18', status: '已完成' },

    // TC004 产品研发 - 25条
    { taskId: 'T-101', taskName: '1000MW高效发电机电磁优化', taskClassId: 'TC004', category: '技术方案', projectId: 'RD-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 200, difficulty: 3.0, startDate: '2024-10-08', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-102', taskName: '1000MW发电机损耗分析', taskClassId: 'TC004', category: '技术方案', projectId: 'RD-001', assigneeId: '1007204', checkerId: '3003407', approverId: '3005925', workload: 150, difficulty: 2.5, startDate: '2024-10-12', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-103', taskName: '1000MW发电机效率提升方案', taskClassId: 'TC004', category: '方案评审', projectId: 'RD-001', assigneeId: '3004412', checkerId: '3003407', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-10-18', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-104', taskName: '燃气轮发电机高温绝缘材料测试', taskClassId: 'TC004', category: '设计流程', projectId: 'RD-002', assigneeId: '1007690', checkerId: '3003407', approverId: '3005925', workload: 180, difficulty: 2.5, startDate: '2024-10-10', dueDate: '2024-12-30', status: '已完成' },
    { taskId: 'T-105', taskName: '绝缘材料耐温性能验证', taskClassId: 'TC004', category: '试验验证', projectId: 'RD-002', assigneeId: '3010758', checkerId: '1007690', approverId: '3005925', workload: 120, difficulty: 2.0, startDate: '2024-10-15', dueDate: '2024-12-15', status: '已完成' },
    { taskId: 'T-106', taskName: '新型绝缘配方研究', taskClassId: 'TC004', category: '技术方案', projectId: 'RD-002', assigneeId: '3003407', checkerId: '1007690', approverId: '3005925', workload: 160, difficulty: 2.5, startDate: '2024-10-20', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-107', taskName: '智能监测系统需求分析', taskClassId: 'TC004', category: '技术方案', projectId: 'RD-003', assigneeId: '3007227', checkerId: '3001226', approverId: '3005925', workload: 80, difficulty: 1.5, startDate: '2024-10-08', dueDate: '2024-11-15', status: '已完成' },
    { taskId: 'T-108', taskName: '传感器选型与测试', taskClassId: 'TC004', category: '设计流程', projectId: 'RD-003', assigneeId: '3003407', checkerId: '3007227', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-10-12', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-109', taskName: '监测软件架构设计', taskClassId: 'TC004', category: '出图', projectId: 'RD-003', assigneeId: '1007204', checkerId: '3001226', approverId: '3005925', workload: 140, difficulty: 2.5, startDate: '2024-10-18', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-110', taskName: '定子绕组振动仿真分析', taskClassId: 'TC004', category: '技术方案', projectId: 'RD-004', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 200, difficulty: 3.0, startDate: '2024-10-10', dueDate: '2024-12-30', status: '已完成' },
    { taskId: 'T-111', taskName: '振动监测方案设计', taskClassId: 'TC004', category: '方案评审', projectId: 'RD-004', assigneeId: '1008072', checkerId: '3004412', approverId: '3002684', workload: 100, difficulty: 2.0, startDate: '2024-10-20', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-112', taskName: '振动数据处理算法', taskClassId: 'TC004', category: '设计流程', projectId: 'RD-004', assigneeId: '3010758', checkerId: '3001226', approverId: '3005925', workload: 120, difficulty: 2.0, startDate: '2024-10-25', dueDate: '2024-12-15', status: '已完成' },
    { taskId: 'T-113', taskName: '300MW模块化发电机概念设计', taskClassId: 'TC004', category: '技术方案', projectId: 'RD-005', assigneeId: '1006279', checkerId: '3001226', approverId: '3005925', workload: 180, difficulty: 2.5, startDate: '2024-10-08', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-114', taskName: '模块化方案总体布局', taskClassId: 'TC004', category: '出图', projectId: 'RD-005', assigneeId: '1007204', checkerId: '1006279', approverId: '3005925', workload: 120, difficulty: 2.0, startDate: '2024-10-15', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-115', taskName: '模块化设计评审', taskClassId: 'TC004', category: '方案评审', projectId: 'RD-005', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 60, difficulty: 1.5, startDate: '2024-10-22', dueDate: '2024-11-10', status: '已完成' },
    { taskId: 'T-116', taskName: '发电机专利申请文件撰写', taskClassId: 'TC004', category: '专利申请', projectId: 'RD-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 80, difficulty: 1.5, startDate: '2024-11-05', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-117', taskName: '高效发电机试验验证方案', taskClassId: 'TC004', category: '设计流程', projectId: 'RD-001', assigneeId: '1007690', checkerId: '3003407', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-11-10', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-118', taskName: '绝缘材料专利申请', taskClassId: 'TC004', category: '专利申请', projectId: 'RD-002', assigneeId: '3010758', checkerId: '3001226', approverId: '3005925', workload: 70, difficulty: 1.5, startDate: '2024-11-15', dueDate: '2024-12-05', status: '已完成' },
    { taskId: 'T-119', taskName: '智能监测系统原型开发', taskClassId: 'TC004', category: '出图', projectId: 'RD-003', assigneeId: '3007227', checkerId: '3003407', approverId: '3005925', workload: 200, difficulty: 3.0, startDate: '2024-11-20', dueDate: '2025-01-10', status: '已完成' },
    { taskId: 'T-120', taskName: '振动分析专利申请', taskClassId: 'TC004', category: '专利申请', projectId: 'RD-004', assigneeId: '1007204', checkerId: '3004412', approverId: '3002684', workload: 50, difficulty: 1.0, startDate: '2024-11-25', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-121', taskName: '模块化发电机详细设计', taskClassId: 'TC004', category: '出图', projectId: 'RD-005', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 250, difficulty: 3.0, startDate: '2024-11-28', dueDate: '2025-01-15', status: '已完成' },
    { taskId: 'T-122', taskName: '产品研发总结报告', taskClassId: 'TC004', category: '设计总结', projectId: 'RD-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-12-10', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-123', taskName: '绝缘材料研发总结', taskClassId: 'TC004', category: '设计总结', projectId: 'RD-002', assigneeId: '1007690', checkerId: '3003407', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-12-15', dueDate: '2024-12-28', status: '已完成' },
    { taskId: 'T-124', taskName: '智能监测系统测试报告', taskClassId: 'TC004', category: '设计总结', projectId: 'RD-003', assigneeId: '3007227', checkerId: '3001226', approverId: '3005925', workload: 80, difficulty: 1.5, startDate: '2024-12-20', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-125', taskName: '振动分析研究报告', taskClassId: 'TC004', category: '设计总结', projectId: 'RD-004', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 70, difficulty: 1.5, startDate: '2024-12-25', dueDate: '2025-01-08', status: '已完成' },

    // TC005 科研任务 - 20条
    { taskId: 'T-126', taskName: '高效发电机开题报告', taskClassId: 'TC005', category: '开题报告', projectId: 'RD-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-10-08', dueDate: '2024-10-20', status: '已完成' },
    { taskId: 'T-127', taskName: '高温绝缘材料开题报告', taskClassId: 'TC005', category: '开题报告', projectId: 'RD-002', assigneeId: '1007690', checkerId: '3003407', approverId: '3005925', workload: 35, difficulty: 1.0, startDate: '2024-10-10', dueDate: '2024-10-22', status: '已完成' },
    { taskId: 'T-128', taskName: '智能监测系统开题报告', taskClassId: 'TC005', category: '开题报告', projectId: 'RD-003', assigneeId: '3007227', checkerId: '3001226', approverId: '3005925', workload: 30, difficulty: 0.8, startDate: '2024-10-12', dueDate: '2024-10-20', status: '已完成' },
    { taskId: 'T-129', taskName: '振动分析开题报告', taskClassId: 'TC005', category: '开题报告', projectId: 'RD-004', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 35, difficulty: 1.0, startDate: '2024-10-15', dueDate: '2024-10-25', status: '已完成' },
    { taskId: 'T-130', taskName: '模块化发电机开题报告', taskClassId: 'TC005', category: '开题报告', projectId: 'RD-005', assigneeId: '1006279', checkerId: '3005922', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-10-18', dueDate: '2024-10-28', status: '已完成' },
    { taskId: 'T-131', taskName: '高效发电机专利申请', taskClassId: 'TC005', category: '专利申请', projectId: 'RD-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-10-25', dueDate: '2024-11-15', status: '已完成' },
    { taskId: 'T-132', taskName: '智能监测系统专利申请', taskClassId: 'TC005', category: '专利申请', projectId: 'RD-003', assigneeId: '3007227', checkerId: '3001226', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-11-05', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-133', taskName: '振动分析专利申请', taskClassId: 'TC005', category: '专利申请', projectId: 'RD-004', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 45, difficulty: 1.0, startDate: '2024-11-10', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-134', taskName: '高效发电机结题报告', taskClassId: 'TC005', category: '结题报告', projectId: 'RD-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 80, difficulty: 2.0, startDate: '2024-12-15', dueDate: '2024-12-30', status: '已完成' },
    { taskId: 'T-135', taskName: '高温绝缘材料结题报告', taskClassId: 'TC005', category: '结题报告', projectId: 'RD-002', assigneeId: '1007690', checkerId: '3003407', approverId: '3005925', workload: 70, difficulty: 1.5, startDate: '2024-12-18', dueDate: '2024-12-28', status: '已完成' },
    { taskId: 'T-136', taskName: '智能监测系统结题报告', taskClassId: 'TC005', category: '结题报告', projectId: 'RD-003', assigneeId: '3007227', checkerId: '3001226', approverId: '3005925', workload: 75, difficulty: 1.5, startDate: '2024-12-20', dueDate: '2024-12-30', status: '已完成' },
    { taskId: 'T-137', taskName: '振动分析结题报告', taskClassId: 'TC005', category: '结题报告', projectId: 'RD-004', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 65, difficulty: 1.5, startDate: '2024-12-22', dueDate: '2024-12-28', status: '已完成' },
    { taskId: 'T-138', taskName: '模块化发电机结题报告', taskClassId: 'TC005', category: '结题报告', projectId: 'RD-005', assigneeId: '1006279', checkerId: '3005922', approverId: '3005925', workload: 70, difficulty: 1.5, startDate: '2024-12-25', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-139', taskName: '科研项目中期检查报告', taskClassId: 'TC005', category: '其他', projectId: 'RD-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-11-15', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-140', taskName: '科研经费使用报告', taskClassId: 'TC005', category: '其他', projectId: 'RD-002', assigneeId: '1007690', checkerId: '3001226', approverId: '3005925', workload: 30, difficulty: 0.8, startDate: '2024-11-20', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-141', taskName: '科研成果转化评估', taskClassId: 'TC005', category: '其他', projectId: 'RD-003', assigneeId: '3007227', checkerId: '3003407', approverId: '3005925', workload: 35, difficulty: 1.0, startDate: '2024-11-25', dueDate: '2024-12-05', status: '已完成' },
    { taskId: 'T-142', taskName: '科研论文撰写', taskClassId: 'TC005', category: '其他', projectId: 'RD-004', assigneeId: '3004412', checkerId: '3001226', approverId: '3005925', workload: 100, difficulty: 2.0, startDate: '2024-12-01', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-143', taskName: '学术会议论文投稿', taskClassId: 'TC005', category: '其他', projectId: 'RD-005', assigneeId: '1006279', checkerId: '3003407', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-12-05', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-144', taskName: '科研项目验收材料准备', taskClassId: 'TC005', category: '结题报告', projectId: 'RD-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2025-01-02', dueDate: '2025-01-12', status: '已完成' },
    { taskId: 'T-145', taskName: '科研成果归档', taskClassId: 'TC005', category: '其他', projectId: 'RD-002', assigneeId: '1007690', checkerId: '3003407', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2025-01-05', dueDate: '2025-01-15', status: '已完成' },

    // TC006 改造服务 - 15条
    { taskId: 'T-146', taskName: '350MW发电机增容改造前期调研', taskClassId: 'TC006', category: '前期项目配合', projectId: 'PRJ-003', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-10-08', dueDate: '2024-10-25', status: '已完成' },
    { taskId: 'T-147', taskName: '350MW发电机增容可行性分析', taskClassId: 'TC006', category: '方案编制', projectId: 'PRJ-003', assigneeId: '1007204', checkerId: '3003407', approverId: '3005925', workload: 80, difficulty: 2.0, startDate: '2024-10-12', dueDate: '2024-11-05', status: '已完成' },
    { taskId: 'T-148', taskName: '350MW发电机改造技术方案', taskClassId: 'TC006', category: '方案编制', projectId: 'PRJ-003', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 100, difficulty: 2.5, startDate: '2024-10-18', dueDate: '2024-11-15', status: '已完成' },
    { taskId: 'T-149', taskName: '500MW发电机励磁改造', taskClassId: 'TC006', category: '前期项目配合', projectId: 'PRJ-002', assigneeId: '1008072', checkerId: '3003407', approverId: '3002684', workload: 50, difficulty: 1.5, startDate: '2024-10-20', dueDate: '2024-11-10', status: '已完成' },
    { taskId: 'T-150', taskName: '500MW发电机励磁系统改造方案', taskClassId: 'TC006', category: '方案编制', projectId: 'PRJ-002', assigneeId: '3010758', checkerId: '1008072', approverId: '3002684', workload: 70, difficulty: 1.5, startDate: '2024-10-25', dueDate: '2024-11-15', status: '已完成' },
    { taskId: 'T-151', taskName: '660MW发电机冷却系统改造', taskClassId: 'TC006', category: '前期项目配合', projectId: 'PRJ-001', assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 60, difficulty: 1.5, startDate: '2024-11-01', dueDate: '2024-11-20', status: '已完成' },
    { taskId: 'T-152', taskName: '660MW发电机水冷改造方案', taskClassId: 'TC006', category: '方案编制', projectId: 'PRJ-001', assigneeId: '1007204', checkerId: '3003407', approverId: '3005925', workload: 90, difficulty: 2.0, startDate: '2024-11-05', dueDate: '2024-11-25', status: '已完成' },
    { taskId: 'T-153', taskName: '改造项目用户需求确认', taskClassId: 'TC006', category: '其他', projectId: 'PRJ-003', assigneeId: '3004412', checkerId: '3003407', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-11-15', dueDate: '2024-11-20', status: '已完成' },
    { taskId: 'T-154', taskName: '改造项目技术协议签订', taskClassId: 'TC006', category: '方案编制', projectId: 'PRJ-002', assigneeId: '1008072', checkerId: '1005184', approverId: '3002684', workload: 40, difficulty: 1.0, startDate: '2024-11-20', dueDate: '2024-11-30', status: '已完成' },
    { taskId: 'T-155', taskName: '改造项目合同评审', taskClassId: 'TC006', category: '其他', projectId: 'PRJ-001', assigneeId: '1008513', checkerId: '3001226', approverId: '3005925', workload: 20, difficulty: 0.8, startDate: '2024-11-25', dueDate: '2024-11-28', status: '已完成' },
    { taskId: 'T-156', taskName: '发电机改造进度计划', taskClassId: 'TC006', category: '其他', projectId: 'PRJ-003', assigneeId: '3003407', checkerId: '3005925', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-12-01', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-157', taskName: '改造项目质量控制计划', taskClassId: 'TC006', category: '其他', projectId: 'PRJ-002', assigneeId: '1008344', checkerId: '3003407', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-12-05', dueDate: '2024-12-15', status: '已完成' },
    { taskId: 'T-158', taskName: '改造项目现场服务安排', taskClassId: 'TC006', category: '其他', projectId: 'PRJ-001', assigneeId: '3010758', checkerId: '3003407', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-12-10', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-159', taskName: '改造项目验收标准制定', taskClassId: 'TC006', category: '方案编制', projectId: 'PRJ-003', assigneeId: '3004412', checkerId: '1006279', approverId: '3002684', workload: 35, difficulty: 1.0, startDate: '2024-12-15', dueDate: '2024-12-25', status: '已完成' },
    { taskId: 'T-160', taskName: '改造项目竣工报告', taskClassId: 'TC006', category: '其他', projectId: 'PRJ-002', assigneeId: '1008072', checkerId: '3003407', approverId: '3002684', workload: 50, difficulty: 1.5, startDate: '2024-12-20', dueDate: '2024-12-30', status: '已完成' },

    // TC007 内部会议与培训 - 20条
    { taskId: 'T-161', taskName: '新员工发电机设计基础培训', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-10-08', dueDate: '2024-10-15', status: '已完成' },
    { taskId: 'T-162', taskName: '汽轮发电机设计规范培训', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-10-15', dueDate: '2024-10-22', status: '已完成' },
    { taskId: 'T-163', taskName: '燃气轮发电机专题研讨会', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '1005184', checkerId: '3001226', approverId: '3005925', workload: 20, difficulty: 0.8, startDate: '2024-10-20', dueDate: '2024-10-25', status: '已完成' },
    { taskId: 'T-164', taskName: '核电发电机设计要求培训', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '1006279', checkerId: '3001226', approverId: '3002684', workload: 35, difficulty: 1.0, startDate: '2024-10-25', dueDate: '2024-11-01', status: '已完成' },
    { taskId: 'T-165', taskName: '11月班务会', taskClassId: 'TC007', category: '班务会', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 10, difficulty: 0.5, startDate: '2024-11-01', dueDate: '2024-11-05', status: '已完成' },
    { taskId: 'T-166', taskName: '发电机设计评审会', taskClassId: 'TC007', category: '设计评审会', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 25, difficulty: 1.0, startDate: '2024-11-08', dueDate: '2024-11-10', status: '已完成' },
    { taskId: 'T-167', taskName: '新员工实操培训', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-11-10', dueDate: '2024-11-20', status: '已完成' },
    { taskId: 'T-168', taskName: '12月党建会议', taskClassId: 'TC007', category: '党建会议', projectId: null, assigneeId: '3002684', checkerId: '3005925', approverId: '3005925', workload: 8, difficulty: 0.5, startDate: '2024-12-01', dueDate: '2024-12-05', status: '已完成' },
    { taskId: 'T-169', taskName: '12月班务会', taskClassId: 'TC007', category: '班务会', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 10, difficulty: 0.5, startDate: '2024-12-01', dueDate: '2024-12-05', status: '已完成' },
    { taskId: 'T-170', taskName: '年度工作总结会议', taskClassId: 'TC007', category: '设计评审会', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-12-10', dueDate: '2024-12-12', status: '已完成' },
    { taskId: 'T-171', taskName: '质量意识培训', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '1008344', checkerId: '3001226', approverId: '3005925', workload: 20, difficulty: 0.8, startDate: '2024-12-15', dueDate: '2024-12-18', status: '已完成' },
    { taskId: 'T-172', taskName: '专利撰写技巧培训', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '3003407', checkerId: '3001226', approverId: '3005925', workload: 15, difficulty: 0.5, startDate: '2024-12-18', dueDate: '2024-12-20', status: '已完成' },
    { taskId: 'T-173', taskName: '1月班务会', taskClassId: 'TC007', category: '班务会', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 10, difficulty: 0.5, startDate: '2025-01-02', dueDate: '2025-01-05', status: '已完成' },
    { taskId: 'T-174', taskName: '2025年度工作计划讨论会', taskClassId: 'TC007', category: '设计评审会', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 25, difficulty: 1.0, startDate: '2025-01-05', dueDate: '2025-01-07', status: '已完成' },
    { taskId: 'T-175', taskName: '安全教育培训', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '1008513', checkerId: '3001226', approverId: '3005925', workload: 15, difficulty: 0.5, startDate: '2025-01-08', dueDate: '2025-01-10', status: '已完成' },
    { taskId: 'T-176', taskName: '新技术交流会', taskClassId: 'TC007', category: '资料讨论会', projectId: null, assigneeId: '3005922', checkerId: '3001226', approverId: '3005925', workload: 20, difficulty: 0.8, startDate: '2025-01-10', dueDate: '2025-01-12', status: '已完成' },
    { taskId: 'T-177', taskName: '项目经验分享会', taskClassId: 'TC007', category: '设计评审会', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 25, difficulty: 1.0, startDate: '2025-01-12', dueDate: '2025-01-14', status: '已完成' },
    { taskId: 'T-178', taskName: '规范标准更新解读', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '1006279', checkerId: '3001226', approverId: '3005925', workload: 20, difficulty: 0.8, startDate: '2025-01-14', dueDate: '2025-01-16', status: '已完成' },
    { taskId: 'T-179', taskName: '软件工具培训', taskClassId: 'TC007', category: '学习与培训', projectId: null, assigneeId: '3007227', checkerId: '3001226', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2025-01-16', dueDate: '2025-01-18', status: '已完成' },
    { taskId: 'T-180', taskName: '团队建设活动', taskClassId: 'TC007', category: '其他', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 15, difficulty: 0.5, startDate: '2025-01-18', dueDate: '2025-01-19', status: '已完成' },

    // TC008 行政与党建 - 10条
    { taskId: 'T-181', taskName: '11月工作总结报告', taskClassId: 'TC008', category: '总结报告', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-11-25', dueDate: '2024-11-28', status: '已完成' },
    { taskId: 'T-182', taskName: '12月工作总结报告', taskClassId: 'TC008', category: '总结报告', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-12-25', dueDate: '2024-12-28', status: '已完成' },
    { taskId: 'T-183', taskName: '2024年度工作总结', taskClassId: 'TC008', category: '总结报告', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-12-20', dueDate: '2024-12-28', status: '已完成' },
    { taskId: 'T-184', taskName: '2025年度工作计划', taskClassId: 'TC008', category: '总结报告', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2025-01-02', dueDate: '2025-01-08', status: '已完成' },
    { taskId: 'T-185', taskName: '周进度汇报PPT', taskClassId: 'TC008', category: 'ppt汇报', projectId: null, assigneeId: '1008513', checkerId: '3001226', approverId: '3005925', workload: 15, difficulty: 0.5, startDate: '2024-10-08', dueDate: '2024-10-08', status: '已完成' },
    { taskId: 'T-186', taskName: '月度进度汇报PPT', taskClassId: 'TC008', category: 'ppt汇报', projectId: null, assigneeId: '1008513', checkerId: '3001226', approverId: '3005925', workload: 25, difficulty: 0.8, startDate: '2024-11-01', dueDate: '2024-11-02', status: '已完成' },
    { taskId: 'T-187', taskName: '季度进度汇报PPT', taskClassId: 'TC008', category: 'ppt汇报', projectId: null, assigneeId: '1008513', checkerId: '3001226', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2025-01-02', dueDate: '2025-01-03', status: '已完成' },
    { taskId: 'T-188', taskName: '项目统计报表', taskClassId: 'TC008', category: '报表填报', projectId: null, assigneeId: '3010758', checkerId: '3001226', approverId: '3005925', workload: 20, difficulty: 0.8, startDate: '2024-10-25', dueDate: '2024-10-26', status: '已完成' },
    { taskId: 'T-189', taskName: '人员考勤报表', taskClassId: 'TC008', category: '报表填报', projectId: null, assigneeId: '1008513', checkerId: '3005925', approverId: '3005925', workload: 10, difficulty: 0.5, startDate: '2024-11-01', dueDate: '2024-11-01', status: '已完成' },
    { taskId: 'T-190', taskName: '设备台账更新', taskClassId: 'TC008', category: '报表填报', projectId: null, assigneeId: '3004412', checkerId: '3001226', approverId: '3005925', workload: 15, difficulty: 0.5, startDate: '2024-12-15', dueDate: '2024-12-16', status: '已完成' },

    // TC009 差旅任务 - 15条
    { taskId: 'T-191', taskName: '印尼项目现场技术服务', taskClassId: 'TC009', category: '其他任务出差', projectId: 'MKT-001', assigneeId: '3003407', checkerId: '3005925', approverId: '3005925', workload: 40, difficulty: 1.5, startDate: '2024-10-20', dueDate: '2024-10-30', status: '已完成', travelLocation: '印尼雅加达', travelDuration: 7, travelLabel: '项目支持' },
    { taskId: 'T-192', taskName: '越南项目用户拜访', taskClassId: 'TC009', category: '市场配合出差', projectId: 'MKT-002', assigneeId: '1005184', checkerId: '3001226', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-11-05', dueDate: '2024-11-12', status: '已完成', travelLocation: '越南河内', travelDuration: 5, travelLabel: '市场开拓' },
    { taskId: 'T-193', taskName: '巴基斯坦核电项目验收', taskClassId: 'TC009', category: '核电项目执行出差', projectId: 'MKT-003', assigneeId: '1006279', checkerId: '3003407', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2024-11-10', dueDate: '2024-11-25', status: '已完成', travelLocation: '巴基斯坦卡拉奇', travelDuration: 10, travelLabel: '项目验收' },
    { taskId: 'T-194', taskName: '华能电厂现场服务', taskClassId: 'TC009', category: '常规项目执行出差', projectId: 'PRJ-001', assigneeId: '3004412', checkerId: '3003407', approverId: '3005925', workload: 35, difficulty: 1.0, startDate: '2024-11-15', dueDate: '2024-11-22', status: '已完成', travelLocation: '陕西榆林', travelDuration: 5, travelLabel: '现场服务' },
    { taskId: 'T-195', taskName: '国电电厂设备调试', taskClassId: 'TC009', category: '常规项目执行出差', projectId: 'PRJ-002', assigneeId: '1008072', checkerId: '3003407', approverId: '3002684', workload: 45, difficulty: 1.5, startDate: '2024-11-20', dueDate: '2024-11-30', status: '已完成', travelLocation: '河北秦皇岛', travelDuration: 7, travelLabel: '设备调试' },
    { taskId: 'T-196', taskName: '核电项目技术交流', taskClassId: 'TC009', category: '核电项目执行出差', projectId: 'NUC-001', assigneeId: '3003407', checkerId: '3005925', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-12-01', dueDate: '2024-12-08', status: '已完成', travelLocation: '江苏田湾', travelDuration: 4, travelLabel: '技术交流' },
    { taskId: 'T-197', taskName: '科研项目试验现场', taskClassId: 'TC009', category: '科研出差', projectId: 'RD-002', assigneeId: '3010758', checkerId: '3001226', approverId: '3005925', workload: 40, difficulty: 1.5, startDate: '2024-12-05', dueDate: '2024-12-15', status: '已完成', travelLocation: '上海', travelDuration: 6, travelLabel: '试验测试' },
    { taskId: 'T-198', taskName: '孟加拉项目前期考察', taskClassId: 'TC009', category: '市场配合出差', projectId: 'MKT-004', assigneeId: '1005184', checkerId: '3001226', approverId: '3005925', workload: 35, difficulty: 1.0, startDate: '2024-12-08', dueDate: '2024-12-15', status: '已完成', travelLocation: '达卡', travelDuration: 5, travelLabel: '市场考察' },
    { taskId: 'T-199', taskName: '大唐电厂现场服务', taskClassId: 'TC009', category: '常规项目执行出差', projectId: 'PRJ-003', assigneeId: '1006279', checkerId: '3003407', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2024-12-10', dueDate: '2024-12-16', status: '已完成', travelLocation: '云南大理', travelDuration: 4, travelLabel: '现场服务' },
    { taskId: 'T-200', taskName: '昌江核电项目支持', taskClassId: 'TC009', category: '核电项目执行出差', projectId: 'NUC-002', assigneeId: '3004412', checkerId: '3003407', approverId: '3002684', workload: 40, difficulty: 1.5, startDate: '2024-12-15', dueDate: '2024-12-25', status: '已完成', travelLocation: '海南昌江', travelDuration: 6, travelLabel: '项目支持' },
    { taskId: 'T-201', taskName: '国内项目投标答辩', taskClassId: 'TC009', category: '市场配合出差', projectId: 'MKT-005', assigneeId: '3003407', checkerId: '3005925', approverId: '3005925', workload: 25, difficulty: 1.0, startDate: '2024-12-18', dueDate: '2024-12-22', status: '已完成', travelLocation: '北京', travelDuration: 3, travelLabel: '投标答辩' },
    { taskId: 'T-202', taskName: '设备厂家调研', taskClassId: 'TC009', category: '科研出差', projectId: 'RD-001', assigneeId: '1007690', checkerId: '3001226', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2025-01-02', dueDate: '2025-01-08', status: '已完成', travelLocation: '哈尔滨', travelDuration: 4, travelLabel: '厂家调研' },
    { taskId: 'T-203', taskName: '漳州核电技术支持', taskClassId: 'TC009', category: '核电项目执行出差', projectId: 'NUC-003', assigneeId: '3010758', checkerId: '3003407', approverId: '3005925', workload: 35, difficulty: 1.0, startDate: '2025-01-05', dueDate: '2025-01-12', status: '已完成', travelLocation: '福建漳州', travelDuration: 5, travelLabel: '技术支持' },
    { taskId: 'T-204', taskName: '华电项目现场服务', taskClassId: 'TC009', category: '常规项目执行出差', projectId: 'PRJ-004', assigneeId: '1005184', checkerId: '3001226', approverId: '3005925', workload: 30, difficulty: 1.0, startDate: '2025-01-08', dueDate: '2025-01-14', status: '已完成', travelLocation: '湖北荆州', travelDuration: 4, travelLabel: '现场服务' },
    { taskId: 'T-205', taskName: '客户年终拜访', taskClassId: 'TC009', category: '市场配合出差', projectId: null, assigneeId: '3003407', checkerId: '3005925', approverId: '3005925', workload: 25, difficulty: 1.0, startDate: '2025-01-10', dueDate: '2025-01-18', status: '已完成', travelLocation: '多地', travelDuration: 5, travelLabel: '客户维护' },

    // TC010 其他任务 - 5条
    { taskId: 'T-206', taskName: '部门ISO9001体系文件更新', taskClassId: 'TC010', category: '通用任务', projectId: null, assigneeId: '1008344', checkerId: '3001226', approverId: '3005925', workload: 40, difficulty: 1.0, startDate: '2024-11-01', dueDate: '2024-11-20', status: '已完成' },
    { taskId: 'T-207', taskName: '设计软件许可证更新', taskClassId: 'TC010', category: '通用任务', projectId: null, assigneeId: '3007227', checkerId: '3001226', approverId: '3005925', workload: 10, difficulty: 0.5, startDate: '2024-11-15', dueDate: '2024-11-18', status: '已完成' },
    { taskId: 'T-208', taskName: '办公设备采购申请', taskClassId: 'TC010', category: '通用任务', projectId: null, assigneeId: '1008513', checkerId: '3001226', approverId: '3005925', workload: 15, difficulty: 0.5, startDate: '2024-12-01', dueDate: '2024-12-10', status: '已完成' },
    { taskId: 'T-209', taskName: '年度固定资产盘点', taskClassId: 'TC010', category: '通用任务', projectId: null, assigneeId: '1008513', checkerId: '3001226', approverId: '3005925', workload: 25, difficulty: 0.8, startDate: '2024-12-20', dueDate: '2024-12-28', status: '已完成' },
    { taskId: 'T-210', taskName: '2025年预算编制', taskClassId: 'TC010', category: '通用任务', projectId: null, assigneeId: '3001226', checkerId: '3005925', approverId: '3005925', workload: 50, difficulty: 1.5, startDate: '2025-01-05', dueDate: '2025-01-15', status: '已完成' },
];

const allTasks = [...tasks, ...tasksContinued];

// HTTP客户端
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.token = null;
    }

    async login(userId, password) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password })
            });
            const data = await response.json();
            // API返回 Success (大写)
            if (data.Success && data.Data && data.Data.Token) {
                this.token = data.Data.Token;
                console.log(`✓ 登录成功: ${userId}`);
                return true;
            }
            console.log(`✗ 登录失败: ${userId}`);
            return false;
        } catch (error) {
            console.error(`登录错误: ${error.message}`);
            return false;
        }
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    async createProject(data) {
        try {
            const response = await fetch(`${this.baseUrl}/api/projects`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            const text = await response.text();
            // 检查是否是重复键错误（项目已存在）
            if (text.includes('Duplicate') || text.includes('重复')) {
                return true; // 视为成功，项目已存在
            }
            if (!response.ok) {
                console.log(`  项目API响应(错误): ${text.substring(0, 200)}`);
                return false;
            }
            try {
                const result = JSON.parse(text);
                return result.success;
            } catch {
                return false;
            }
        } catch (error) {
            console.error(`创建项目失败: ${error.message}`);
            return false;
        }
    }

    async createTask(data) {
        try {
            const response = await fetch(`${this.baseUrl}/api/tasks`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            const text = await response.text();
            if (!response.ok) {
                console.log(`  任务API响应(错误): ${text.substring(0, 300)}`);
            }
            try {
                const result = JSON.parse(text);
                return result.success;
            } catch {
                return false;
            }
        } catch (error) {
            console.error(`创建任务失败: ${error.message}`);
            return false;
        }
    }
}

// 主导入函数
async function importData() {
    const client = new ApiClient(API_BASE_URL);

    console.log('='.repeat(60));
    console.log('热电专业示例数据导入程序');
    console.log('='.repeat(60));
    console.log(`API地址: ${API_BASE_URL}`);
    console.log('');

    // 1. 登录
    console.log('步骤1: 登录系统...');
    const loginSuccess = await client.login(ADMIN_USER, ADMIN_PASS);
    if (!loginSuccess) {
        console.error('登录失败，无法继续导入数据');
        process.exit(1);
    }
    console.log('');

    // 2. 导入项目
    console.log('步骤2: 导入项目数据...');
    let projectSuccess = 0;
    let projectFail = 0;
    for (const project of projects) {
        // 映射到API字段名 (ASP.NET Core 默认使用 System.Text.Json，对大小写敏感)
        const data = {
            Name: project.name,
            Category: project.category,
            WorkNo: null, // 让后端自动生成
            Capacity: project.capacity,
            Model: project.model,
            StartDate: new Date().toISOString(),
            EndDate: null,
            Remark: null,
            IsKeyProject: false,
            IsWon: project.isWon || false,
            IsForeign: project.isForeign || false,
            IsCommissioned: project.isCommissioned || false,
            IsCompleted: project.isCompleted || false
        };

        const success = await client.createProject(data);
        if (success) {
            projectSuccess++;
            console.log(`  ✓ 项目: ${project.name}`);
        } else {
            projectFail++;
            console.log(`  ✗ 项目: ${project.name} (创建失败)`);
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // 避免请求过快
    }
    console.log(`  项目导入完成: 成功 ${projectSuccess}, 失败 ${projectFail}`);
    console.log('');

    // 3. 导入任务
    console.log('步骤3: 导入任务数据...');
    let taskSuccess = 0;
    let taskFail = 0;
    let taskByCategory = {};

    for (const task of allTasks) {
        // 映射项目ID到后端生成的ID
        const mappedProjectId = task.projectId ? (projectIdMapping[task.projectId] || null) : null;

        // 映射到API字段名 (ASP.NET Core 默认使用 System.Text.Json，对大小写敏感)
        const data = {
            TaskName: task.taskName,
            TaskClassID: task.taskClassId,
            Category: task.category,
            ProjectID: mappedProjectId,
            AssigneeID: task.assigneeId,
            AssigneeName: getPersonName(task.assigneeId),
            StartDate: task.startDate ? new Date(task.startDate).toISOString() : null,
            DueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
            Difficulty: task.difficulty,
            Remark: task.workload ? `预估工作量: ${task.workload}小时` : null,
            CheckerID: task.checkerId,
            ChiefDesignerID: null,
            ApproverID: task.approverId,
            // 差旅任务字段
            TravelLocation: task.travelLocation || null,
            TravelDuration: task.travelDuration || null,
            TravelLabel: task.travelLabel || null
        };

        const success = await client.createTask(data);
        if (success) {
            taskSuccess++;
            const cat = task.taskClassId;
            taskByCategory[cat] = (taskByCategory[cat] || 0) + 1;
            if (taskSuccess % 20 === 0) {
                console.log(`  已导入 ${taskSuccess} 条任务...`);
            }
        } else {
            taskFail++;
            console.log(`  ✗ 任务: ${task.taskName}`);
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // 避免请求过快
    }

    console.log('');
    console.log(`  任务导入完成: 成功 ${taskSuccess}, 失败 ${taskFail}`);
    console.log('');
    console.log('  任务分类统计:');
    for (const [cat, count] of Object.entries(taskByCategory)) {
        console.log(`    ${cat}: ${count}条`);
    }
    console.log('');

    // 4. 完成
    console.log('='.repeat(60));
    console.log('导入完成!');
    console.log(`  项目: ${projectSuccess} 成功, ${projectFail} 失败`);
    console.log(`  任务: ${taskSuccess} 成功, ${taskFail} 失败`);
    console.log('='.repeat(60));
}

// 获取人员姓名
function getPersonName(userId) {
    const person = personnelList.find(p => p.id === userId);
    return person ? person.name : userId;
}

// 运行导入
importData().catch(console.error);
