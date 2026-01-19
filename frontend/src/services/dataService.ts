/**
 * @deprecated
 * 此服务已不再使用，请使用 apiDataService
 * 保留此文件仅作为参考，不会在生产环境中使用
 */
import { User, Project, Task, TaskClass, TaskPoolItem, SystemRole, OfficeLocation, PersonnelStatus, ProjectCategory, TaskStatus, RoleStatus, Period, PersonalStats, SeparatedTasks, WorkDayInfo } from '../types';

const STORAGE_KEYS = {
  USERS: 'rd_users',
  PROJECTS: 'rd_projects',
  TASKS: 'rd_tasks',
  TASK_CLASSES: 'rd_task_classes',
  CURRENT_USER: 'rd_current_user',
  // New keys for settings and features
  EQUIPMENT_MODELS: 'rd_equipment_models',
  CAPACITY_LEVELS: 'rd_capacity_levels',
  TRAVEL_LABELS: 'rd_travel_labels',
  USER_AVATARS: 'rd_user_avatars',
  TASK_CATEGORIES: 'rd_task_categories',
  TASK_POOL: 'rd_task_pool'
};

// Default task categories configuration
const DEFAULT_TASK_CATEGORIES: Record<string, string[]> = {
  'MARKET': ['标书', '复询', '技术方案', '其他'],
  'EXECUTION': ['搭建生产资料', '设计院提资', 'CT配合与提资', '随机资料', '项目特殊项处理', '用户配合', '图纸会签', '传真回复', '其他'],
  'NUCLEAR': ['核电设计', '核安全审查', '设备调试', '常规岛配合', '核岛接口', '技术方案', '其他'],
  'PRODUCT_DEV': ['技术方案', '设计流程', '方案评审', '专利申请', '出图', '图纸改版', '设计总结'],
  'RESEARCH': ['开题报告', '专利申请', '结题报告', '其他'],
  'RENOVATION': ['前期项目配合', '方案编制', '其他'],
  'MEETING_TRAINING': ['学习与培训', '党建会议', '班务会', '设计评审会', '资料讨论会', '其他'],
  'ADMIN_PARTY': ['报表填报', 'ppt汇报', '总结报告', '其他'],
  'TRAVEL': ['市场配合出差', '常规项目执行出差', '核电项目执行出差', '科研出差', '改造服务出差', '其他任务出差'],
  'OTHER': ['通用任务']
};

// TaskClassID to Category Code mapping
const TASKCLASS_TO_CATEGORY: Record<string, string> = {
  'TC001': 'MARKET',
  'TC002': 'EXECUTION',
  'TC003': 'NUCLEAR',
  'TC004': 'PRODUCT_DEV',
  'TC005': 'RESEARCH',
  'TC006': 'RENOVATION',
  'TC007': 'MEETING_TRAINING',
  'TC008': 'ADMIN_PARTY',
  'TC009': 'TRAVEL',
  'TC010': 'OTHER'
};

// --- Seed Data ---

const seedUsers: User[] = [
  {
    UserID: 'admin',
    Name: '系统管理员',
    SystemRole: SystemRole.ADMIN,
    OfficeLocation: OfficeLocation.CHENGDU,
    Status: PersonnelStatus.ACTIVE,
    JoinDate: '2020-01-01',
    Password: 'admin',
    Title: '高级主任工程师'
  },
  {
    UserID: 'LEADER001',
    Name: '张组长',
    SystemRole: SystemRole.LEADER,
    OfficeLocation: OfficeLocation.DEYANG,
    Status: PersonnelStatus.ACTIVE,
    JoinDate: '2015-05-15',
    Password: '123',
    Title: '主任工程师'
  },
  {
    UserID: 'USER001',
    Name: '李研发',
    SystemRole: SystemRole.MEMBER,
    OfficeLocation: OfficeLocation.CHENGDU,
    Status: PersonnelStatus.ACTIVE,
    JoinDate: '2022-07-01',
    Password: '123',
    Title: '工程师'
  },
  {
    UserID: 'USER002',
    Name: '王设计',
    SystemRole: SystemRole.MEMBER,
    OfficeLocation: OfficeLocation.CHENGDU,
    Status: PersonnelStatus.ACTIVE,
    JoinDate: '2021-03-15',
    Password: '123',
    Title: '设计工程师'
  },
  {
    UserID: 'USER003',
    Name: '陈工程师',
    SystemRole: SystemRole.MEMBER,
    OfficeLocation: OfficeLocation.DEYANG,
    Status: PersonnelStatus.ACTIVE,
    JoinDate: '2020-09-01',
    Password: '123',
    Title: '机械工程师'
  },
  {
    UserID: 'USER004',
    Name: '刘技术',
    SystemRole: SystemRole.MEMBER,
    OfficeLocation: OfficeLocation.CHENGDU,
    Status: PersonnelStatus.ACTIVE,
    JoinDate: '2023-02-01',
    Password: '123',
    Title: '技术员'
  },
  {
    UserID: 'USER005',
    Name: '赵项目',
    SystemRole: SystemRole.LEADER,
    OfficeLocation: OfficeLocation.DEYANG,
    Status: PersonnelStatus.ACTIVE,
    JoinDate: '2018-06-01',
    Password: '123',
    Title: '项目主管'
  },
  {
    UserID: 'USER006',
    Name: '孙质量',
    SystemRole: SystemRole.MEMBER,
    OfficeLocation: OfficeLocation.CHENGDU,
    Status: PersonnelStatus.ACTIVE,
    JoinDate: '2019-11-01',
    Password: '123',
    Title: '质量工程师'
  },
  {
    UserID: 'USER007',
    Name: '周研发',
    SystemRole: SystemRole.MEMBER,
    OfficeLocation: OfficeLocation.DEYANG,
    Status: PersonnelStatus.ACTIVE,
    JoinDate: '2021-08-15',
    Password: '123',
    Title: '研发工程师'
  }
];

const seedProjects: Project[] = [
  // 市场配合项目 (5个)
  {
    id: 'P001',
    name: '某国外抽水蓄能电站投标项目',
    category: ProjectCategory.MARKET,
    workNo: 'MARKET-2025-001',
    capacity: '1200MW',
    model: 'Francis',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    isWon: true,
    isForeign: true,
    remark: '海外大型抽水蓄能项目，技术要求高，需要定制化设计方案'
  },
  {
    id: 'P002',
    name: '国内大型水电站投标项目',
    category: ProjectCategory.MARKET,
    workNo: 'MARKET-2025-002',
    capacity: '1000MW',
    model: 'Francis',
    startDate: '2025-02-10',
    endDate: '2025-07-15',
    isWon: true,
    isForeign: false,
    remark: '国内重点水电项目，竞争激烈'
  },
  {
    id: 'P003',
    name: '海外小水电投标项目',
    category: ProjectCategory.MARKET,
    workNo: 'MARKET-2025-003',
    capacity: '50MW',
    model: 'Pelton',
    startDate: '2025-03-01',
    endDate: '2025-05-30',
    isWon: false,
    isForeign: true,
    remark: '非洲地区小水电项目，价格敏感'
  },
  {
    id: 'P004',
    name: '一带一路水电项目投标',
    category: ProjectCategory.MARKET,
    workNo: 'MARKET-2025-004',
    capacity: '800MW',
    model: 'Kaplan',
    startDate: '2025-01-20',
    endDate: '2025-08-20',
    isWon: false,
    isForeign: true,
    remark: '配合一带一路倡议的重要水电项目'
  },
  {
    id: 'P005',
    name: '抽水蓄能电站技术方案项目',
    category: ProjectCategory.MARKET,
    workNo: 'MARKET-2025-005',
    capacity: '600MW',
    model: 'Francis',
    startDate: '2025-04-01',
    endDate: '2025-09-30',
    isWon: true,
    isForeign: false,
    remark: '国内重点抽水蓄能项目，技术方案已中标'
  },

  // 常规项目 (5个)
  {
    id: 'P006',
    name: '白鹤滩水电站左岸机组制造',
    category: ProjectCategory.EXECUTION,
    workNo: 'EXECUTION-2025-001',
    capacity: '1000MW',
    model: 'Francis',
    startDate: '2025-01-05',
    endDate: '2025-12-20',
    isCommissioned: false,
    remark: '世界最大水电站机组制造项目，技术难度极高'
  },
  {
    id: 'P007',
    name: '溪洛渡水电站机组改造项目',
    category: ProjectCategory.EXECUTION,
    workNo: 'EXECUTION-2025-002',
    capacity: '770MW',
    model: 'Francis',
    startDate: '2025-02-15',
    endDate: '2025-10-30',
    isCommissioned: true,
    remark: '提升机组效率，降低水耗'
  },
  {
    id: 'P008',
    name: '向家坝水电站优化项目',
    category: ProjectCategory.EXECUTION,
    workNo: 'EXECUTION-2025-003',
    capacity: '600MW',
    model: 'Francis',
    startDate: '2025-03-10',
    endDate: '2025-11-15',
    isCommissioned: false,
    remark: '优化水轮机水力性能，提高发电效率'
  },
  {
    id: 'P009',
    name: '乌东德水电站维护项目',
    category: ProjectCategory.EXECUTION,
    workNo: 'EXECUTION-2025-004',
    capacity: '850MW',
    model: 'Francis',
    startDate: '2025-01-20',
    endDate: '2025-09-20',
    isCommissioned: true,
    remark: '定期维护保养，确保机组安全稳定运行'
  },
  {
    id: 'P010',
    name: '龙滩水电站扩建项目',
    category: ProjectCategory.EXECUTION,
    workNo: 'EXECUTION-2025-005',
    capacity: '700MW',
    model: 'Francis',
    startDate: '2025-04-05',
    endDate: '2025-12-31',
    isCommissioned: false,
    remark: '增加机组容量，提升整体发电能力'
  },

  // 核电项目 (5个)
  {
    id: 'P011',
    name: '华龙一号常规岛设计项目',
    category: ProjectCategory.NUCLEAR,
    workNo: 'NUCLEAR-2025-001',
    capacity: '1200MW',
    model: 'Nuclear Steam Turbine',
    startDate: '2025-01-10',
    endDate: '2025-12-15',
    isCommissioned: false,
    remark: '自主三代核电技术常规岛设计，安全性要求极高'
  },
  {
    id: 'P012',
    name: 'CAP1400核电项目配合',
    category: ProjectCategory.NUCLEAR,
    workNo: 'NUCLEAR-2025-002',
    capacity: '1400MW',
    model: 'CAP1400',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    isCommissioned: false,
    remark: '大型先进压水堆核电项目，参与常规岛部分设计'
  },
  {
    id: 'P013',
    name: '某核电站汽轮机改造项目',
    category: ProjectCategory.NUCLEAR,
    workNo: 'NUCLEAR-2025-003',
    capacity: '1000MW',
    model: 'Nuclear Steam Turbine',
    startDate: '2025-03-15',
    endDate: '2025-10-20',
    isCommissioned: true,
    remark: '提升核电汽轮机效率和可靠性'
  },
  {
    id: 'P014',
    name: '高温气冷堆常规岛项目',
    category: ProjectCategory.NUCLEAR,
    workNo: 'NUCLEAR-2025-004',
    capacity: '200MW',
    model: 'HTR Steam Turbine',
    startDate: '2025-04-01',
    endDate: '2025-12-01',
    isCommissioned: false,
    remark: '第四代核电技术，常温气体冷却反应堆'
  },
  {
    id: 'P015',
    name: '核电设备国产化项目',
    category: ProjectCategory.NUCLEAR,
    workNo: 'NUCLEAR-2025-005',
    capacity: '1100MW',
    model: 'AP1000',
    startDate: '2025-01-25',
    endDate: '2025-11-25',
    isCommissioned: false,
    remark: '推进核电关键设备国产化，降低依赖性'
  },

  // 科研项目 (5个)
  {
    id: 'P016',
    name: '新型水轮机叶片材料研发',
    category: ProjectCategory.RESEARCH,
    workNo: 'RESEARCH-2025-001',
    capacity: '1000MW',
    model: 'Francis',
    startDate: '2025-01-08',
    endDate: '2025-12-08',
    isCompleted: false,
    remark: '研发高强度、抗空化新型叶片材料，延长使用寿命'
  },
  {
    id: 'P017',
    name: '水电站智能化运维系统研发',
    category: ProjectCategory.RESEARCH,
    workNo: 'RESEARCH-2025-002',
    capacity: '500MW',
    model: 'Kaplan',
    startDate: '2025-02-20',
    endDate: '2025-10-20',
    isCompleted: false,
    remark: '基于AI和大数据的智能运维平台开发'
  },
  {
    id: 'P018',
    name: '水轮机增容改造技术研究',
    category: ProjectCategory.RESEARCH,
    workNo: 'RESEARCH-2025-003',
    capacity: '700MW',
    model: 'Francis',
    startDate: '2025-03-05',
    endDate: '2025-11-05',
    isCompleted: false,
    remark: '研究在不更换主要设备前提下提升机组容量技术'
  },
  {
    id: 'P019',
    name: '绿色能源储能技术研发',
    category: ProjectCategory.RESEARCH,
    workNo: 'RESEARCH-2025-004',
    capacity: '300MW',
    model: 'Pump-Turbine',
    startDate: '2025-01-30',
    endDate: '2025-09-30',
    isCompleted: false,
    remark: '研发高效储能技术，支撑新能源并网'
  },
  {
    id: 'P020',
    name: '水电机组振动控制技术研发',
    category: ProjectCategory.RESEARCH,
    workNo: 'RESEARCH-2025-005',
    capacity: '800MW',
    model: 'Francis',
    startDate: '2025-04-10',
    endDate: '2025-12-10',
    isCompleted: false,
    remark: '研发主动振动控制技术，保障机组安全运行'
  },

  // 改造项目 (5个)
  {
    id: 'P021',
    name: '三峡左岸机组改造升级',
    category: ProjectCategory.RENOVATION,
    workNo: 'RENOVATION-2025-001',
    capacity: '700MW',
    model: 'Francis',
    startDate: '2025-01-12',
    endDate: '2025-08-12',
    isCompleted: false,
    remark: '提升三峡左岸机组效率和稳定性，延长服役年限'
  },
  {
    id: 'P022',
    name: '葛洲坝水电站机电改造',
    category: ProjectCategory.RENOVATION,
    workNo: 'RENOVATION-2025-002',
    capacity: '170MW',
    model: 'Rotary',
    startDate: '2025-02-25',
    endDate: '2025-09-25',
    isCompleted: false,
    remark: '更换老旧机电设备，提升自动化水平'
  },
  {
    id: 'P023',
    name: '小浪底水电站设备更新',
    category: ProjectCategory.RENOVATION,
    workNo: 'RENOVATION-2025-003',
    capacity: '300MW',
    model: 'Francis',
    startDate: '2025-03-15',
    endDate: '2025-10-15',
    isCompleted: false,
    remark: '更新主要发电设备，提高可靠性'
  },
  {
    id: 'P024',
    name: '二滩水电站自动化改造',
    category: ProjectCategory.RENOVATION,
    workNo: 'RENOVATION-2025-004',
    capacity: '550MW',
    model: 'Francis',
    startDate: '2025-01-28',
    endDate: '2025-08-28',
    isCompleted: true,
    remark: '全面升级自动化系统，实现远程监控'
  },
  {
    id: 'P025',
    name: '水口水电站增效扩容改造',
    category: ProjectCategory.RENOVATION,
    workNo: 'RENOVATION-2025-005',
    capacity: '200MW',
    model: 'Kaplan',
    startDate: '2025-04-08',
    endDate: '2025-11-08',
    isCompleted: false,
    remark: '通过技术改造提升机组效率和容量'
  },

  // 其他项目 (5个)
  {
    id: 'P026',
    name: '水电站员工技能培训项目',
    category: ProjectCategory.OTHER,
    workNo: 'OTHER-2025-001',
    capacity: '1000MW',
    model: 'Francis',
    startDate: '2025-01-15',
    endDate: '2025-06-15',
    isCompleted: true,
    remark: '提升员工专业技能和运维水平'
  },
  {
    id: 'P027',
    name: '水电行业标准制定项目',
    category: ProjectCategory.OTHER,
    workNo: 'OTHER-2025-002',
    capacity: '500MW',
    model: 'Kaplan',
    startDate: '2025-02-01',
    endDate: '2025-12-31',
    isCompleted: false,
    remark: '参与制定水电行业技术标准和规范'
  },
  {
    id: 'P028',
    name: '水电站安全评估项目',
    category: ProjectCategory.OTHER,
    workNo: 'OTHER-2025-003',
    capacity: '800MW',
    model: 'Francis',
    startDate: '2025-03-10',
    endDate: '2025-07-10',
    isCompleted: true,
    remark: '全面评估水电站运行安全状况'
  },
  {
    id: 'P029',
    name: '水电技术国际交流项目',
    category: ProjectCategory.OTHER,
    workNo: 'OTHER-2025-004',
    capacity: '600MW',
    model: 'Pelton',
    startDate: '2025-01-20',
    endDate: '2025-11-20',
    isCompleted: false,
    remark: '与国际同行开展技术交流与合作'
  },
  {
    id: 'P030',
    name: '水电站环境影响评价项目',
    category: ProjectCategory.OTHER,
    workNo: 'OTHER-2025-005',
    capacity: '400MW',
    model: 'Francis',
    startDate: '2025-04-01',
    endDate: '2025-10-01',
    isCompleted: false,
    remark: '评估水电站对生态环境的影响，提出改善措施'
  }
];

// Task Pool Seed Data (20 items)
const seedTaskPoolItems: TaskPoolItem[] = [
  // TC001 - 市场配合项目
  {
    id: 'TP001',
    TaskName: '某国外抽水蓄能电站投标-技术方案编制',
    TaskClassID: 'TC001',
    Category: '技术方案',
    ProjectID: 'P001',
    ProjectName: '某国外抽水蓄能电站投标项目',
    PersonInChargeID: 'USER001',
    PersonInChargeName: '李研发',
    CheckerID: 'LEADER001',
    CheckerName: '张组长',
    StartDate: '2025-12-01',
    DueDate: '2025-12-15',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-28',
    isForceAssessment: true,
    Remark: '重点投标项目，需优先完成'
  },
  {
    id: 'TP002',
    TaskName: '国内大型水电站投标-报价分析',
    TaskClassID: 'TC001',
    Category: '报价分析',
    ProjectID: 'P002',
    ProjectName: '国内大型水电站投标项目',
    PersonInChargeID: 'USER002',
    PersonInChargeName: '王设计',
    CheckerID: 'LEADER001',
    CheckerName: '张组长',
    StartDate: '2025-12-05',
    DueDate: '2025-12-20',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-25',
    isForceAssessment: false,
    Remark: ''
  },
  {
    id: 'TP003',
    TaskName: '抽水蓄能技术方案-设计优化',
    TaskClassID: 'TC001',
    Category: '设计优化',
    ProjectID: 'P005',
    ProjectName: '抽水蓄能电站技术方案项目',
    PersonInChargeID: 'USER003',
    PersonInChargeName: '陈工程师',
    CheckerID:'USER001',
    CheckerName:'李研发',
    StartDate: '2025-12-10',
    DueDate: '2025-12-25',
    CreatedBy: 'admin',
    CreatedByName: '系统管理员',
    CreatedDate: '2025-11-20',
    isForceAssessment: false,
    Remark: '配合中标项目的技术优化'
  },

  // TC002 - 常规项目
  {
    id: 'TP004',
    TaskName: '白鹤滩水电站-施工图设计',
    TaskClassID: 'TC002',
    Category: '施工图设计',
    ProjectID: 'P006',
    ProjectName: '白鹤滩水电站左岸机组制造',
    PersonInChargeID: 'USER001',
    PersonInChargeName: '李研发',
    CheckerID:'USER002',
    CheckerName:'王设计',
    ApproverID: 'LEADER001',
    ApproverName: '张组长',
    StartDate: '2025-12-01',
    DueDate: '2025-12-31',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-15',
    isForceAssessment: true,
    Remark: '关键节点，按期完成'
  },
  {
    id: 'TP005',
    TaskName: '溪洛渡改造-技术方案',
    TaskClassID: 'TC002',
    Category: '技术方案',
    ProjectID: 'P007',
    ProjectName: '溪洛渡水电站机组改造项目',
    PersonInChargeID: 'USER003',
    PersonInChargeName: '陈工程师',
    CheckerID:'USER006',
    CheckerName:'孙质量',
    StartDate: '2025-12-08',
    DueDate: '2025-12-22',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-18',
    isForceAssessment: false,
    Remark: ''
  },
  {
    id: 'TP006',
    TaskName: '向家坝优化-现场配合',
    TaskClassID: 'TC002',
    Category: '现场配合',
    ProjectID: 'P008',
    ProjectName: '向家坝水电站优化项目',
    PersonInChargeID: 'USER004',
    PersonInChargeName: '刘技术',
    CheckerID:'USER005',
    CheckerName:'赵项目',
    StartDate: '2025-12-15',
    DueDate: '2025-12-29',
    CreatedBy: 'USER005',
    CreatedByName: '赵项目',
    CreatedDate: '2025-11-22',
    isForceAssessment: false,
    Remark: '需要现场出差'
  },
  {
    id: 'TP007',
    TaskName: '龙滩扩建-图纸会签',
    TaskClassID: 'TC002',
    Category: '图纸会签',
    ProjectID: 'P010',
    ProjectName: '龙滩水电站扩建项目',
    PersonInChargeID: 'USER006',
    PersonInChargeName: '孙质量',
    CheckerID:'USER002',
    CheckerName:'王设计',
    StartDate: '2025-12-03',
    DueDate: '2025-12-17',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-10',
    isForceAssessment: true,
    Remark: '会签流程需加快'
  },

  // TC003 - 核电项目
  {
    id: 'TP008',
    TaskName: '华龙一号-设计计算',
    TaskClassID: 'TC003',
    Category: '设计计算',
    ProjectID: 'P011',
    ProjectName: '华龙一号常规岛设计项目',
    PersonInChargeID: 'USER001',
    PersonInChargeName: '李研发',
    CheckerID: 'LEADER001',
    CheckerName: '张组长',
    ApproverID: 'USER007',
    ApproverName: '周工艺',
    StartDate: '2025-12-01',
    DueDate: '2025-12-20',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-12',
    isForceAssessment: true,
    Remark: '核电项目，安全第一'
  },
  {
    id: 'TP009',
    TaskName: 'CAP1400-技术评审',
    TaskClassID: 'TC003',
    Category: '技术评审',
    ProjectID: 'P012',
    ProjectName: 'CAP1400核电项目配合',
    PersonInChargeID: 'USER002',
    PersonInChargeName: '王设计',
    CheckerID:'USER001',
    CheckerName:'李研发',
    StartDate: '2025-12-05',
    DueDate: '2025-12-19',
    CreatedBy: 'admin',
    CreatedByName: '系统管理员',
    CreatedDate: '2025-11-08',
    isForceAssessment: false,
    Remark: ''
  },
  {
    id: 'TP010',
    TaskName: '高温气冷堆-方案设计',
    TaskClassID: 'TC003',
    Category: '方案设计',
    ProjectID: 'P014',
    ProjectName: '高温气冷堆常规岛项目',
    PersonInChargeID: 'USER003',
    PersonInChargeName: '陈工程师',
    CheckerID: 'LEADER001',
    CheckerName: '张组长',
    StartDate: '2025-12-10',
    DueDate: '2025-12-24',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-05',
    isForceAssessment: false,
    Remark: '新技术路线，需谨慎'
  },

  // TC004 - 产品研发
  {
    id: 'TP011',
    TaskName: '新型叶片-材料测试',
    TaskClassID: 'TC004',
    Category: '材料测试',
    ProjectID: 'P016',
    ProjectName: '新型水轮机叶片材料研发',
    PersonInChargeID: 'USER006',
    PersonInChargeName: '孙质量',
    CheckerID:'USER003',
    CheckerName:'陈工程师',
    StartDate: '2025-12-01',
    DueDate: '2025-12-15',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-01',
    isForceAssessment: true,
    Remark: '研发关键阶段'
  },
  {
    id: 'TP012',
    TaskName: '智能监测-算法开发',
    TaskClassID: 'TC004',
    Category: '软件开发',
    ProjectID: 'P017',
    ProjectName: '水电站智能监测系统研发',
    PersonInChargeID: 'USER004',
    PersonInChargeName: '刘技术',
    CheckerID:'USER001',
    CheckerName:'李研发',
    StartDate: '2025-12-08',
    DueDate: '2025-12-22',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-03',
    isForceAssessment: false,
    Remark: ''
  },

  // TC005 - 科研项目
  {
    id: 'TP013',
    TaskName: ' CFD分析-模型建立',
    TaskClassID: 'TC005',
    Category: '数值模拟',
    ProjectID: 'P018',
    ProjectName: '水轮机 CFD 性能优化研究',
    PersonInChargeID: 'USER001',
    PersonInChargeName: '李研发',
    CheckerID:'USER002',
    CheckerName:'王设计',
    StartDate: '2025-12-01',
    DueDate: '2025-12-20',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-10-28',
    isForceAssessment: false,
    Remark: '科研课题结题准备'
  },
  {
    id: 'TP014',
    TaskName: '振动研究-实验测试',
    TaskClassID: 'TC005',
    Category: '实验测试',
    ProjectID: 'P019',
    ProjectName: '水轮机振动特性研究',
    PersonInChargeID: 'USER003',
    PersonInChargeName: '陈工程师',
    CheckerID:'USER006',
    CheckerName:'孙质量',
    StartDate: '2025-12-05',
    DueDate: '2025-12-19',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-10-25',
    isForceAssessment: false,
    Remark: ''
  },

  // TC006 - 改造项目
  {
    id: 'TP015',
    TaskName: '三峡改造-设计评审',
    TaskClassID: 'TC006',
    Category: '设计评审',
    ProjectID: 'P021',
    ProjectName: '三峡左岸机组改造项目',
    PersonInChargeID: 'USER002',
    PersonInChargeName: '王设计',
    CheckerID: 'LEADER001',
    CheckerName: '张组长',
    ApproverID: 'USER005',
    ApproverName: '赵项目',
    StartDate: '2025-12-01',
    DueDate: '2025-12-15',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-02',
    isForceAssessment: true,
    Remark: '重点项目，优先处理'
  },
  {
    id: 'TP016',
    TaskName: '葛洲坝改造-施工方案',
    TaskClassID: 'TC006',
    Category: '施工方案',
    ProjectID: 'P022',
    ProjectName: '葛洲坝水电站机电改造',
    PersonInChargeID: 'USER004',
    PersonInChargeName: '刘技术',
    CheckerID:'USER003',
    CheckerName:'陈工程师',
    StartDate: '2025-12-10',
    DueDate: '2025-12-24',
    CreatedBy: 'USER005',
    CreatedByName: '赵项目',
    CreatedDate: '2025-11-10',
    isForceAssessment: false,
    Remark: ''
  },
  {
    id: 'TP017',
    TaskName: '小浪底更新-设备选型',
    TaskClassID: 'TC006',
    Category: '设备选型',
    ProjectID: 'P023',
    ProjectName: '小浪底水电站设备更新',
    PersonInChargeID: 'USER006',
    PersonInChargeName: '孙质量',
    CheckerID:'USER002',
    CheckerName:'王设计',
    StartDate: '2025-12-08',
    DueDate: '2025-12-22',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-15',
    isForceAssessment: false,
    Remark: ''
  },

  // TC008 - 行政与党建
  {
    id: 'TP018',
    TaskName: '年度总结报告',
    TaskClassID: 'TC008',
    Category: '行政事务',
    ProjectID: undefined,
    PersonInChargeID: 'LEADER001',
    PersonInChargeName: '张组长',
    CheckerID:'admin',
    CheckerName:'系统管理员',
    StartDate: '2025-12-01',
    DueDate: '2025-12-15',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-20',
    isForceAssessment: false,
    Remark: '年度工作汇报'
  },
  {
    id: 'TP019',
    TaskName: '党支部活动组织',
    TaskClassID: 'TC008',
    Category: '党建活动',
    ProjectID: undefined,
    PersonInChargeID: 'USER005',
    PersonInChargeName: '赵项目',
    CheckerID: 'LEADER001',
    CheckerName: '张组长',
    StartDate: '2025-12-15',
    DueDate: '2025-12-25',
    CreatedBy: 'LEADER001',
    CreatedByName: '张组长',
    CreatedDate: '2025-11-18',
    isForceAssessment: false,
    Remark: '12月主题党日活动'
  },

  // TC010 - 其他
  {
    id: 'TP020',
    TaskName: '技术标准编制',
    TaskClassID: 'TC010',
    Category: '标准规范',
    ProjectID: 'P027',
    ProjectName: '水电行业标准制定项目',
    PersonInChargeID: 'USER001',
    PersonInChargeName: '李研发',
    CheckerID: 'LEADER001',
    CheckerName: '张组长',
    StartDate: '2025-12-01',
    DueDate: '2025-12-30',
    CreatedBy: 'admin',
    CreatedByName: '系统管理员',
    CreatedDate: '2025-11-01',
    isForceAssessment: false,
    Remark: '行业标准参编工作'
  }
];

const seedTaskClasses: TaskClass[] = [
  {
    id: 'TC001',
    name: '市场配合',
    code: 'MARKET',
    description: '市场配合相关任务',
    notice: '注意：市场配合任务请确保关联正确的投标项目，并填写容量等级和机型信息。技术方案和报价分析需经过评审后方可提交。'
  },
  {
    id: 'TC002',
    name: '常规项目执行',
    code: 'EXECUTION',
    description: '常规项目执行相关任务',
    notice: '注意：任务名称请遵循 "[项目名]-[任务类别]" 格式。请及时更新任务进度，项目特殊项处理需备注具体问题描述。'
  },
  {
    id: 'TC003',
    name: '核电项目执行',
    code: 'NUCLEAR',
    description: '核电项目执行相关任务',
    notice: '注意：核电项目任务需严格遵循核安全相关规范。所有设计变更必须经过评审确认后方可实施，请确保校核和审查流程完整。'
  },
  {
    id: 'TC004',
    name: '产品研发',
    code: 'PRODUCT_DEV',
    description: '产品研发相关任务',
    notice: '注意：产品研发任务需做好技术记录和方案评审。专利申请需在任务完成后及时提交，出图任务需经过完整的设计评审流程。'
  },
  {
    id: 'TC005',
    name: '科研任务',
    code: 'RESEARCH',
    description: '科研任务相关工作',
    notice: '注意：科研任务的开题报告和结题报告需按规定格式编写。专利申请和论文发表请在任务备注中注明，便于成果统计。'
  },
  {
    id: 'TC006',
    name: '改造服务',
    code: 'RENOVATION',
    description: '改造服务相关任务',
    notice: '注意：改造项目需充分考虑现场条件和既有设备情况。方案编制前请做好现场调研，确保改造方案切实可行。'
  },
  {
    id: 'TC008',
    name: '行政与党建',
    code: 'ADMIN_PARTY',
    description: '行政与党建相关工作',
    notice: '注意：行政与党建类任务请按时完成。报表类任务请确保数据准确，汇报类任务请提前准备材料。'
  },
  {
    id: 'TC007',
    name: '内部会议与培训',
    code: 'MEETING_TRAINING',
    description: '内部会议与培训相关工作',
    notice: '注意：会议培训任务请如实记录参会人员。培训任务需填写培训时长，培训结束后请及时提交培训总结和相关材料。'
  },
  {
    id: 'TC009',
    name: '差旅任务',
    code: 'TRAVEL',
    description: '差旅相关任务',
    notice: '注意：差旅任务请填写出差地点和出差天数。出差结束后请及时提交出差报告，市场出差需关联对应的市场配合项目。'
  },
  {
    id: 'TC010',
    name: '其他任务',
    code: 'OTHER',
    description: '其他类型任务',
    notice: '注意：请根据任务性质选择合适的分类。通用任务也请尽量填写关联项目和相关说明，便于统计和查询。'
  }
];

const seedTasks: Task[] = [
  // === 本周任务 (2026-01-01 ~ 2026-01-07) ===
  {
    TaskID: 'T-20260102-001',
    TaskName: '白鹤滩项目技术方案-本周任务',
    TaskClassID: 'TC001',
    Category: '技术方案',
    ProjectID: 'P001',
    AssigneeID: 'USER001',
    Status: TaskStatus.DRAFTING,
    Workload: 8,
    Difficulty: 1.5,
    CapacityLevel: '1000MW',
    CheckerID:'USER002',
    ApproverID: 'LEADER001',
    StartDate: '2026-01-02',
    CreatedDate: '2026-01-02',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20260105-002',
    TaskName: '华龙一号设计配合-本周任务',
    TaskClassID: 'TC003',
    Category: '核电设计',
    ProjectID: 'P011',
    AssigneeID: 'USER002',
    Status: TaskStatus.COMPLETED,
    Workload: 12,
    Difficulty: 1.8,
    CapacityLevel: '1200MW',
    CheckerID:'USER001',
    ApproverID: 'USER003',
    StartDate: '2026-01-04',
    CreatedDate: '2026-01-05',
    CreatedBy: 'admin'
  },

  // === 本月任务 (2025-12-01 ~ 2026-01-07) ===
  {
    TaskID: 'T-20251210-010',
    TaskName: '向家坝项目图纸会签-本月任务',
    TaskClassID: 'TC002',
    Category: '图纸会签',
    ProjectID: 'P006',
    AssigneeID: 'USER003',
    Status: TaskStatus.DRAFTING,
    Workload: 10,
    Difficulty: 1.6,
    CapacityLevel: '800MW',
    CheckerID:'USER001',
    ApproverID: 'USER002',
    StartDate: '2025-12-10',
    CreatedDate: '2025-12-10',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20251220-011',
    TaskName: '水轮机叶片研发-本月任务',
    TaskClassID: 'TC005',
    Category: '技术方案',
    ProjectID: 'P016',
    AssigneeID: 'USER004',
    Status: TaskStatus.NOT_STARTED,
    Workload: 15,
    Difficulty: 1.9,
    CapacityLevel: '700MW',
    CheckerID:'USER006',
    ApproverID: 'LEADER001',
    StartDate: '2025-12-18',
    CreatedDate: '2025-12-20',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20260103-012',
    TaskName: '月度技术评审会-本月任务',
    TaskClassID: 'TC007',
    Category: '设计评审会',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.DRAFTING,
    Workload: 3,
    Difficulty: 0.5,
    CapacityLevel: 'N/A',
    CheckerID:'USER001',
    ApproverID: 'USER002',
    StartDate: '2026-01-03',
    CreatedDate: '2026-01-03',
    CreatedBy: 'LEADER001'
  },

  // === 近三个月任务 (2025-10-01 ~ 2026-01-07) ===
  {
    TaskID: 'T-20251005-020',
    TaskName: '三峡改造项目方案-近三个月',
    TaskClassID: 'TC006',
    Category: '方案编制',
    ProjectID: 'P021',
    AssigneeID: 'USER005',
    Status: TaskStatus.COMPLETED,
    Workload: 9,
    Difficulty: 1.7,
    CapacityLevel: '700MW',
    CheckerID:'USER001',
    ApproverID: 'USER007',
    StartDate: '2025-10-05',
    CreatedDate: '2025-10-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20251020-021',
    TaskName: '葛洲坝机组改造-近三个月',
    TaskClassID: 'TC006',
    Category: '前期项目配合',
    ProjectID: 'P022',
    AssigneeID: 'USER001',
    Status: TaskStatus.DRAFTING,
    Workload: 8,
    Difficulty: 1.4,
    CapacityLevel: '170MW',
    CheckerID:'USER002',
    ApproverID: 'USER003',
    StartDate: '2025-10-18',
    CreatedDate: '2025-10-20',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20251105-022',
    TaskName: '小浪底设备更新-近三个月',
    TaskClassID: 'TC006',
    Category: '方案编制',
    ProjectID: 'P023',
    AssigneeID: 'USER002',
    Status: TaskStatus.COMPLETED,
    Workload: 10,
    Difficulty: 1.5,
    CapacityLevel: '300MW',
    CheckerID:'USER001',
    ApproverID: 'USER002',
    StartDate: '2025-11-03',
    CreatedDate: '2025-11-05',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20251115-023',
    TaskName: 'CAP1400核电配合-近三个月',
    TaskClassID: 'TC003',
    Category: '核安全审查',
    ProjectID: 'P012',
    AssigneeID: 'USER003',
    Status: TaskStatus.DRAFTING,
    Workload: 11,
    Difficulty: 1.9,
    CapacityLevel: '1400MW',
    CheckerID:'USER001',
    ApproverID: 'USER002',
    StartDate: '2025-11-12',
    CreatedDate: '2025-11-15',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20251125-024',
    TaskName: '智能化运维系统研发-近三个月',
    TaskClassID: 'TC005',
    Category: '设计流程',
    ProjectID: 'P017',
    AssigneeID: 'USER004',
    Status: TaskStatus.COMPLETED,
    Workload: 8,
    Difficulty: 1.5,
    CapacityLevel: '500MW',
    CheckerID:'USER006',
    ApproverID: 'LEADER001',
    StartDate: '2025-11-20',
    CreatedDate: '2025-11-25',
    CreatedBy: 'admin'
  },

  // === 近半年任务 (2025-07-01 ~ 2026-01-07) ===
  {
    TaskID: 'T-20250705-030',
    TaskName: '抽水蓄能投标项目-近半年',
    TaskClassID: 'TC001',
    Category: '技术方案',
    ProjectID: 'P001',
    AssigneeID: 'USER006',
    Status: TaskStatus.COMPLETED,
    Workload: 14,
    Difficulty: 1.8,
    CapacityLevel: '1200MW',
    CheckerID:'USER002',
    ApproverID: 'USER007',
    StartDate: '2025-07-03',
    CreatedDate: '2025-07-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250720-031',
    TaskName: '国内大型水电站投标-近半年',
    TaskClassID: 'TC001',
    Category: '复询',
    ProjectID: 'P002',
    AssigneeID: 'USER001',
    Status: TaskStatus.DRAFTING,
    Workload: 6,
    Difficulty: 1.2,
    CapacityLevel: '1000MW',
    CheckerID:'USER003',
    ApproverID: 'USER002',
    StartDate: '2025-07-18',
    CreatedDate: '2025-07-20',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250810-032',
    TaskName: '白鹤滩设计院提资-近半年',
    TaskClassID: 'TC002',
    Category: '设计院提资',
    ProjectID: 'P006',
    AssigneeID: 'USER002',
    Status: TaskStatus.COMPLETED,
    Workload: 10,
    Difficulty: 1.8,
    CapacityLevel: '1000MW',
    CheckerID:'USER001',
    ApproverID: 'USER007',
    StartDate: '2025-08-08',
    CreatedDate: '2025-08-10',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250825-033',
    TaskName: '溪洛渡资料整理-近半年',
    TaskClassID: 'TC002',
    Category: '搭建生产资料',
    ProjectID: 'P007',
    AssigneeID: 'USER003',
    Status: TaskStatus.DRAFTING,
    Workload: 7,
    Difficulty: 1.3,
    CapacityLevel: '770MW',
    CheckerID:'USER001',
    ApproverID: 'USER002',
    StartDate: '2025-08-22',
    CreatedDate: '2025-08-25',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250905-034',
    TaskName: '华龙一号核岛接口-近半年',
    TaskClassID: 'TC003',
    Category: '核岛接口',
    ProjectID: 'P011',
    AssigneeID: 'USER004',
    Status: TaskStatus.DRAFTING,
    Workload: 12,
    Difficulty: 1.8,
    CapacityLevel: '1200MW',
    CheckerID:'USER006',
    ApproverID: 'USER003',
    StartDate: '2025-09-03',
    CreatedDate: '2025-09-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250915-035',
    TaskName: '水轮机增容改造-近半年',
    TaskClassID: 'TC005',
    Category: '方案评审',
    ProjectID: 'P018',
    AssigneeID: 'USER005',
    Status: TaskStatus.COMPLETED,
    Workload: 7,
    Difficulty: 1.4,
    CapacityLevel: '700MW',
    CheckerID:'USER001',
    ApproverID: 'USER007',
    StartDate: '2025-09-12',
    CreatedDate: '2025-09-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250925-036',
    TaskName: '新员工培训-近半年',
    TaskClassID: 'TC007',
    Category: '学习与培训',
    ProjectID: undefined,
    AssigneeID: 'USER006',
    Status: TaskStatus.COMPLETED,
    Workload: 4,
    Difficulty: 0.8,
    CapacityLevel: 'N/A',
    CheckerID:'LEADER001',
    ApproverID: 'USER002',
    StartDate: '2025-09-22',
    CreatedDate: '2025-09-25',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20251010-037',
    TaskName: '月度报表填报-近半年',
    TaskClassID: 'TC008',
    Category: '报表填报',
    ProjectID: undefined,
    AssigneeID: 'USER001',
    Status: TaskStatus.COMPLETED,
    Workload: 2,
    Difficulty: 0.5,
    CapacityLevel: 'N/A',
    CheckerID:'USER002',
    ApproverID: 'LEADER001',
    StartDate: '2025-10-08',
    CreatedDate: '2025-10-10',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20251020-038',
    TaskName: '核电项目出差-近半年',
    TaskClassID: 'TC009',
    Category: '核电项目执行出差',
    ProjectID: 'P011',
    AssigneeID: 'USER002',
    Status: TaskStatus.DRAFTING,
    Workload: 6,
    Difficulty: 1.5,
    CapacityLevel: '1400MW',
    CheckerID:'USER005',
    ApproverID: 'USER003',
    StartDate: '2025-10-18',
    CreatedDate: '2025-10-20',
    CreatedBy: 'LEADER001'
  },

  // === 仅一年任务 (2025-01-01 ~ 2026-01-07) ===
  {
    TaskID: 'T-20250105-040',
    TaskName: '海外小水电投标-近一年',
    TaskClassID: 'TC001',
    Category: '标书',
    ProjectID: 'P003',
    AssigneeID: 'USER004',
    Status: TaskStatus.NOT_STARTED,
    Workload: 10,
    Difficulty: 1.3,
    CapacityLevel: '50MW',
    CheckerID:'USER006',
    ApproverID: 'USER007',
    StartDate: '2025-01-03',
    CreatedDate: '2025-01-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250120-041',
    TaskName: '一带一路项目投标-近一年',
    TaskClassID: 'TC001',
    Category: '技术方案',
    ProjectID: 'P004',
    AssigneeID: 'USER005',
    Status: TaskStatus.DRAFTING,
    Workload: 12,
    Difficulty: 1.6,
    CapacityLevel: '800MW',
    CheckerID:'USER001',
    ApproverID: 'USER002',
    StartDate: '2025-01-18',
    CreatedDate: '2025-01-20',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250201-042',
    TaskName: '乌东德维护项目-近一年',
    TaskClassID: 'TC002',
    Category: '用户配合',
    ProjectID: 'P009',
    AssigneeID: 'USER006',
    Status: TaskStatus.COMPLETED,
    Workload: 6,
    Difficulty: 1.2,
    CapacityLevel: '850MW',
    CheckerID:'USER001',
    ApproverID: 'USER007',
    StartDate: '2025-01-30',
    CreatedDate: '2025-02-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250215-043',
    TaskName: '龙滩扩建项目-近一年',
    TaskClassID: 'TC002',
    Category: '图纸会签',
    ProjectID: 'P010',
    AssigneeID: 'USER001',
    Status: TaskStatus.NOT_STARTED,
    Workload: 11,
    Difficulty: 1.7,
    CapacityLevel: '700MW',
    CheckerID:'USER002',
    ApproverID: 'USER003',
    StartDate: '2025-02-12',
    CreatedDate: '2025-02-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250301-044',
    TaskName: '高温气冷堆项目-近一年',
    TaskClassID: 'TC003',
    Category: '技术方案',
    ProjectID: 'P014',
    AssigneeID: 'USER002',
    Status: TaskStatus.NOT_STARTED,
    Workload: 13,
    Difficulty: 1.9,
    CapacityLevel: '200MW',
    CheckerID:'USER003',
    ApproverID: 'USER007',
    StartDate: '2025-02-27',
    CreatedDate: '2025-03-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250315-045',
    TaskName: '核电设备国产化-近一年',
    TaskClassID: 'TC003',
    Category: '常规岛配合',
    ProjectID: 'P015',
    AssigneeID: 'USER003',
    Status: TaskStatus.DRAFTING,
    Workload: 11,
    Difficulty: 1.7,
    CapacityLevel: '1100MW',
    CheckerID:'USER002',
    ApproverID: 'USER003',
    StartDate: '2025-03-12',
    CreatedDate: '2025-03-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250401-046',
    TaskName: '专利申请-近一年',
    TaskClassID: 'TC005',
    Category: '专利申请',
    ProjectID: 'P016',
    AssigneeID: 'USER004',
    Status: TaskStatus.DRAFTING,
    Workload: 6,
    Difficulty: 1.3,
    CapacityLevel: '1000MW',
    CheckerID:'USER006',
    ApproverID: 'LEADER001',
    StartDate: '2025-03-28',
    CreatedDate: '2025-04-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250410-047',
    TaskName: '绿色能源储能研发-近一年',
    TaskClassID: 'TC005',
    Category: '开题报告',
    ProjectID: 'P019',
    AssigneeID: 'USER005',
    Status: TaskStatus.NOT_STARTED,
    Workload: 5,
    Difficulty: 1.2,
    CapacityLevel: '300MW',
    CheckerID:'USER001',
    ApproverID: 'USER007',
    StartDate: '2025-04-08',
    CreatedDate: '2025-04-10',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250420-048',
    TaskName: '振动控制技术研发-近一年',
    TaskClassID: 'TC005',
    Category: '设计总结',
    ProjectID: 'P020',
    AssigneeID: 'USER006',
    Status: TaskStatus.DRAFTING,
    Workload: 9,
    Difficulty: 1.6,
    CapacityLevel: '800MW',
    CheckerID:'USER002',
    ApproverID: 'USER003',
    StartDate: '2025-04-18',
    CreatedDate: '2025-04-20',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250505-049',
    TaskName: '二滩自动化改造-近一年',
    TaskClassID: 'TC006',
    Category: '前期项目配合',
    ProjectID: 'P024',
    AssigneeID: 'USER001',
    Status: TaskStatus.DRAFTING,
    Workload: 7,
    Difficulty: 1.3,
    CapacityLevel: '550MW',
    CheckerID:'USER004',
    ApproverID: 'LEADER001',
    StartDate: '2025-05-03',
    CreatedDate: '2025-05-05',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250520-050',
    TaskName: '水口增效扩容-近一年',
    TaskClassID: 'TC006',
    Category: '方案编制',
    ProjectID: 'P025',
    AssigneeID: 'USER002',
    Status: TaskStatus.NOT_STARTED,
    Workload: 11,
    Difficulty: 1.8,
    CapacityLevel: '200MW',
    CheckerID:'USER001',
    ApproverID: 'USER007',
    StartDate: '2025-05-18',
    CreatedDate: '2025-05-20',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250605-051',
    TaskName: '党支部会议-近一年',
    TaskClassID: 'TC007',
    Category: '党建会议',
    ProjectID: undefined,
    AssigneeID: 'USER003',
    Status: TaskStatus.COMPLETED,
    Workload: 2,
    Difficulty: 0.3,
    CapacityLevel: 'N/A',
    CheckerID:'LEADER001',
    ApproverID: 'USER007',
    StartDate: '2025-06-03',
    CreatedDate: '2025-06-05',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250615-052',
    TaskName: '技术讨论会-近一年',
    TaskClassID: 'TC007',
    Category: '资料讨论会',
    ProjectID: 'P001',
    AssigneeID: 'USER004',
    Status: TaskStatus.DRAFTING,
    Workload: 2,
    Difficulty: 0.5,
    CapacityLevel: '1000MW',
    CheckerID:'USER001',
    ApproverID: 'USER002',
    StartDate: '2025-06-12',
    CreatedDate: '2025-06-15',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250625-053',
    TaskName: '年度总结汇报-近一年',
    TaskClassID: 'TC008',
    Category: 'ppt汇报',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.COMPLETED,
    Workload: 6,
    Difficulty: 1.2,
    CapacityLevel: 'N/A',
    CheckerID:'admin',
    ApproverID: 'USER007',
    StartDate: '2025-06-22',
    CreatedDate: '2025-06-25',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250710-054',
    TaskName: '项目总结报告-近一年',
    TaskClassID: 'TC008',
    Category: '总结报告',
    ProjectID: 'P006',
    AssigneeID: 'USER005',
    Status: TaskStatus.DRAFTING,
    Workload: 5,
    Difficulty: 1.0,
    CapacityLevel: '1000MW',
    CheckerID:'USER002',
    ApproverID: 'LEADER001',
    StartDate: '2025-07-08',
    CreatedDate: '2025-07-10',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250725-055',
    TaskName: '市场配合出差-近一年',
    TaskClassID: 'TC009',
    Category: '市场配合出差',
    ProjectID: 'P001',
    AssigneeID: 'USER006',
    Status: TaskStatus.COMPLETED,
    Workload: 5,
    Difficulty: 1.0,
    CapacityLevel: '1200MW',
    CheckerID:'USER001',
    ApproverID: 'LEADER001',
    StartDate: '2025-07-22',
    CreatedDate: '2025-07-25',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250810-056',
    TaskName: '常规项目出差-近一年',
    TaskClassID: 'TC009',
    Category: '常规项目执行出差',
    ProjectID: 'P007',
    AssigneeID: 'USER001',
    Status: TaskStatus.DRAFTING,
    Workload: 7,
    Difficulty: 1.2,
    CapacityLevel: '770MW',
    CheckerID:'USER006',
    ApproverID: 'USER007',
    StartDate: '2025-08-07',
    CreatedDate: '2025-08-10',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250825-057',
    TaskName: '科研出差-近一年',
    TaskClassID: 'TC009',
    Category: '科研出差',
    ProjectID: 'P016',
    AssigneeID: 'USER002',
    Status: TaskStatus.DRAFTING,
    Workload: 6,
    Difficulty: 1.5,
    CapacityLevel: '1000MW',
    CheckerID:'USER005',
    ApproverID: 'USER003',
    StartDate: '2025-08-22',
    CreatedDate: '2025-08-25',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250905-058',
    TaskName: '员工技能培训-近一年',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P026',
    AssigneeID: 'USER003',
    Status: TaskStatus.COMPLETED,
    Workload: 8,
    Difficulty: 1.0,
    CapacityLevel: '1000MW',
    CheckerID:'USER001',
    ApproverID: 'LEADER001',
    StartDate: '2025-09-03',
    CreatedDate: '2025-09-05',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250920-059',
    TaskName: '行业标准制定-近一年',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P027',
    AssigneeID: 'USER004',
    Status: TaskStatus.DRAFTING,
    Workload: 10,
    Difficulty: 1.3,
    CapacityLevel: '500MW',
    CheckerID:'USER006',
    ApproverID: 'LEADER001',
    StartDate: '2025-09-18',
    CreatedDate: '2025-09-20',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20251010-060',
    TaskName: '水电站安全评估-近一年',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P028',
    AssigneeID: 'USER005',
    Status: TaskStatus.COMPLETED,
    Workload: 7,
    Difficulty: 1.2,
    CapacityLevel: '800MW',
    CheckerID:'USER001',
    ApproverID: 'USER002',
    StartDate: '2025-10-08',
    CreatedDate: '2025-10-10',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20251025-061',
    TaskName: '国际技术交流-近一年',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P029',
    AssigneeID: 'USER006',
    Status: TaskStatus.DRAFTING,
    Workload: 9,
    Difficulty: 1.4,
    CapacityLevel: '600MW',
    CheckerID:'USER002',
    ApproverID: 'USER003',
    StartDate: '2025-10-23',
    CreatedDate: '2025-10-25',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20251105-062',
    TaskName: '环境影响评价-近一年',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P030',
    AssigneeID: 'USER001',
    Status: TaskStatus.NOT_STARTED,
    Workload: 6,
    Difficulty: 1.1,
    CapacityLevel: '400MW',
    CheckerID:'USER003',
    ApproverID: 'USER007',
    StartDate: '2025-11-03',
    CreatedDate: '2025-11-05',
    CreatedBy: 'admin'
  }
];

// --- Service Implementation ---

class DataService {
  constructor() {
    this.init();
  }

  init() {
    // Only initialize if data doesn't exist, preserve current user session
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(seedProjects));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(seedTasks));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASK_CLASSES)) {
      localStorage.setItem(STORAGE_KEYS.TASK_CLASSES, JSON.stringify(seedTaskClasses));
    }
    // Initialize task categories if not exist
    if (!localStorage.getItem(STORAGE_KEYS.TASK_CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(DEFAULT_TASK_CATEGORIES));
    }
    // Initialize task pool if not exist
    if (!localStorage.getItem(STORAGE_KEYS.TASK_POOL)) {
      localStorage.setItem(STORAGE_KEYS.TASK_POOL, JSON.stringify(seedTaskPoolItems));
    }
    // Initialize settings from existing data
    this.initializeSettings();
  }

  // 重新初始化所有数据（保留当前用户）
  reinitializeData(): void {
    // 保留当前用户会话
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    // 清除所有数据
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.TASK_CLASSES);
    localStorage.removeItem(STORAGE_KEYS.TASK_CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.TASK_POOL);
    localStorage.removeItem(STORAGE_KEYS.EQUIPMENT_MODELS);
    localStorage.removeItem(STORAGE_KEYS.CAPACITY_LEVELS);
    localStorage.removeItem(STORAGE_KEYS.TRAVEL_LABELS);
    localStorage.removeItem(STORAGE_KEYS.USER_AVATARS);

    // 重新初始化所有数据
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(seedProjects));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(seedTasks));
    localStorage.setItem(STORAGE_KEYS.TASK_CLASSES, JSON.stringify(seedTaskClasses));
    localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(DEFAULT_TASK_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.TASK_POOL, JSON.stringify(seedTaskPoolItems));

    // 恢复当前用户会话
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, currentUser);
    }

    // 重新初始化设置
    this.initializeSettings();
  }

  // 强制刷新任务数据（从seed数据重新加载）
  refreshTasksData(): void {
    // 清除任务数据
    localStorage.removeItem(STORAGE_KEYS.TASKS);

    // 重新加载seed任务数据
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(seedTasks));

    // 重新初始化任务类别设置
    localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(DEFAULT_TASK_CATEGORIES));

    // 重新初始化Travel Labels设置
    const tasks = this.getTasks();
    const travelTasks = tasks.filter(t => t.TaskClassID === 'TC009'); // Travel tasks
    const labels = [...new Set(travelTasks.map(t => t.Category))];
    localStorage.setItem(STORAGE_KEYS.TRAVEL_LABELS, JSON.stringify(labels));
  }

  // Users
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data).filter((u: User) => !u.is_deleted) : [];
  }

  saveUser(user: User): void {
    const users = this.getAllUsersRaw();
    const index = users.findIndex(u => u.UserID === user.UserID);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private getAllUsersRaw(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  deleteUser(userId: string): void {
    const users = this.getAllUsersRaw();
    const user = users.find(u => u.UserID === userId);
    if (user) {
      user.is_deleted = true;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  // Projects
  getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data).filter((p: Project) => !p.is_deleted).sort((a: Project, b: Project) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()) : [];
  }

  saveProject(project: Project): void {
    const projects = this.getAllProjectsRaw();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  private getAllProjectsRaw(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  }

  deleteProject(id: string): void {
    const projects = this.getAllProjectsRaw();
    const project = projects.find(p => p.id === id);
    if (project) {
      project.is_deleted = true;
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }
  }

  // Tasks
  getTasks(): Task[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data).filter((t: Task) => !t.is_deleted).sort((a: Task, b: Task) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime()) : [];
  }

  saveTask(task: Task): void {
    const tasks = this.getAllTasksRaw();
    const index = tasks.findIndex(t => t.TaskID === task.TaskID);
    const isNewTask = index < 0;

    // 如果是市场配合任务且有关联项目，从项目中获取容量等级
    let taskToSave = {...task};
    if (task.TaskClassID === 'TC001' && task.ProjectID) {
      const projects = this.getAllProjectsRaw();
      const project = projects.find(p => p.id === task.ProjectID);
      if (project) {
        taskToSave.CapacityLevel = project.capacity;
      }
    }

    if (index >= 0) {
      tasks[index] = taskToSave;
    } else {
      tasks.push(taskToSave);
    }
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    // Auto-save new task category to settings if it's a new task
    if (isNewTask && task.Category) {
      this.addTaskCategoryToSettings(task.TaskClassID, task.Category);
    }
  }

  private addTaskCategoryToSettings(taskClassID: string, categoryName: string): void {
    const categoryCode = TASKCLASS_TO_CATEGORY[taskClassID];
    if (!categoryCode) return;

    const allCategories = this.getTaskCategories();
    if (!allCategories[categoryCode]) {
      allCategories[categoryCode] = [];
    }
    if (!allCategories[categoryCode].includes(categoryName)) {
      allCategories[categoryCode].push(categoryName);
      localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(allCategories));
    }
  }

  private getAllTasksRaw(): Task[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  }

  deleteTask(taskId: string): void {
    const tasks = this.getAllTasksRaw();
    const task = tasks.find(t => t.TaskID === taskId);
    if (task) {
      task.is_deleted = true;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  // 更新任务的角色状态
  updateTaskRoleStatus(taskId: string, role: 'assignee' | 'checker' | 'chiefDesigner' | 'approver', status: RoleStatus): void {
    const tasks = this.getAllTasksRaw();
    const task = tasks.find(t => t.TaskID === taskId);
    if (task) {
      switch (role) {
        case 'assignee':
          task.assigneeStatus = status;
          break;
        case 'checker':
          task.checkerStatus = status;
          break;
        case 'chiefDesigner':
          task.chiefDesignerStatus = status;
          break;
        case 'approver':
          task.approverStatus = status;
          break;
      }

      // 任务状态与角色状态联动
      if (status === RoleStatus.COMPLETED) {
        // 如果设置为完成，检查是否所有角色都完成
        const allCompleted =
          (task.assigneeStatus === RoleStatus.COMPLETED) &&
          (!task.CheckerID || task.checkerStatus === RoleStatus.COMPLETED) &&
          (!task.ChiefDesignerID || task.chiefDesignerStatus === RoleStatus.COMPLETED) &&
          (!task.ApproverID || task.approverStatus === RoleStatus.COMPLETED);

        if (allCompleted) {
          task.Status = TaskStatus.COMPLETED;
        }
      } else if (status === RoleStatus.IN_PROGRESS || status === RoleStatus.REVISING || status === RoleStatus.REJECTED) {
        // 如果任一角色状态为进行中/修改中/驳回中，任务状态设为进行中
        task.Status = TaskStatus.DRAFTING;
      }
      // 未开始状态不自动更新任务状态，让系统判断

      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  // 当任务状态设为完成时，同步更新所有角色状态为完成
  updateAllRoleStatusToCompleted(taskId: string): void {
    const tasks = this.getAllTasksRaw();
    const task = tasks.find(t => t.TaskID === taskId);
    if (task) {
      task.Status = TaskStatus.COMPLETED;
      if (task.assigneeStatus !== RoleStatus.COMPLETED) {
        task.assigneeStatus = RoleStatus.COMPLETED;
      }
      if (task.CheckerID && task.checkerStatus !== RoleStatus.COMPLETED) {
        task.checkerStatus = RoleStatus.COMPLETED;
      }
      if (task.ChiefDesignerID && task.chiefDesignerStatus !== RoleStatus.COMPLETED) {
        task.chiefDesignerStatus = RoleStatus.COMPLETED;
      }
      if (task.ApproverID && task.approverStatus !== RoleStatus.COMPLETED) {
        task.approverStatus = RoleStatus.COMPLETED;
      }
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  // Task Classes
  getTaskClasses(): TaskClass[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASK_CLASSES);
    return data ? JSON.parse(data).filter((tc: TaskClass) => !tc.is_deleted) : [];
  }

  saveTaskClass(taskClass: TaskClass): void {
    const taskClasses = this.getAllTaskClassesRaw();
    const index = taskClasses.findIndex(tc => tc.id === taskClass.id);
    if (index >= 0) {
      taskClasses[index] = taskClass;
    } else {
      taskClasses.push(taskClass);
    }
    localStorage.setItem(STORAGE_KEYS.TASK_CLASSES, JSON.stringify(taskClasses));
  }

  private getAllTaskClassesRaw(): TaskClass[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASK_CLASSES);
    return data ? JSON.parse(data) : [];
  }

  deleteTaskClass(id: string): void {
    const taskClasses = this.getAllTaskClassesRaw();
    const taskClass = taskClasses.find(tc => tc.id === id);
    if (taskClass) {
      taskClass.is_deleted = true;
      localStorage.setItem(STORAGE_KEYS.TASK_CLASSES, JSON.stringify(taskClasses));
    }
  }

  checkTaskClassUsage(id: string): { hasTasks: boolean; taskCount: number; taskClassCode: string } {
    const tasks = this.getTasks();
    const taskClasses = this.getAllTaskClassesRaw();
    const taskClass = taskClasses.find(tc => tc.id === id);
    const taskCount = tasks.filter(t => t.TaskClassID === id && !t.is_deleted).length;
    return {
      hasTasks: taskCount > 0,
      taskCount,
      taskClassCode: taskClass?.code || ''
    };
  }

  // --- Task Pool (任务库) Management ---

  getTaskPoolItems(): TaskPoolItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASK_POOL);
    return data ? JSON.parse(data).filter((item: TaskPoolItem) => !item.is_deleted).sort((a: TaskPoolItem, b: TaskPoolItem) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime()) : [];
  }

  getTaskPoolItem(id: string): TaskPoolItem | undefined {
    const items = this.getAllTaskPoolItemsRaw();
    return items.find(item => item.id === id && !item.is_deleted);
  }

  saveTaskPoolItem(item: TaskPoolItem): void {
    const items = this.getAllTaskPoolItemsRaw();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.TASK_POOL, JSON.stringify(items));
  }

  deleteTaskPoolItem(id: string): void {
    const items = this.getAllTaskPoolItemsRaw();
    const item = items.find(i => i.id === id);
    if (item) {
      item.is_deleted = true;
      localStorage.setItem(STORAGE_KEYS.TASK_POOL, JSON.stringify(items));
    }
  }

  private getAllTaskPoolItemsRaw(): TaskPoolItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASK_POOL);
    return data ? JSON.parse(data) : [];
  }

  // Assign a pool item to become a full task
  assignPoolItemToTask(poolItemId: string, taskData: Partial<Task>): Task {
    const poolItems = this.getAllTaskPoolItemsRaw();
    const poolItem = poolItems.find(i => i.id === poolItemId);

    if (!poolItem) {
      throw new Error('任务计划不存在');
    }

    // Get project info for capacity level
    let capacityLevel: string | undefined;
    if (poolItem.ProjectID) {
      const projects = this.getAllProjectsRaw();
      const project = projects.find(p => p.id === poolItem.ProjectID);
      if (project) {
        capacityLevel = project.capacity;
      }
    }

    // Create new task from pool item
    const newTask: Task = {
      TaskID: this.generateId('T'),
      TaskName: poolItem.TaskName,
      TaskClassID: poolItem.TaskClassID,
      Category: poolItem.Category,
      ProjectID: poolItem.ProjectID,
      AssigneeID: taskData.AssigneeID,
      AssigneeName: taskData.AssigneeName,
      StartDate: poolItem.StartDate,
      DueDate: poolItem.DueDate,
      Status: TaskStatus.NOT_STARTED,
      Workload: taskData.Workload,
      Difficulty: taskData.Difficulty,
      Remark: poolItem.Remark || taskData.Remark,
      CreatedDate: new Date().toISOString().split('T')[0],
      CreatedBy: poolItem.CreatedBy,
      CheckerID: taskData.CheckerID,
      ApproverID: taskData.ApproverID,
      CheckerName: taskData.CheckerName,
      ApproverName: taskData.ApproverName,
      CheckerWorkload: taskData.CheckerWorkload,
      ApproverWorkload: taskData.ApproverWorkload,
      isForceAssessment: taskData.isForceAssessment,
      CapacityLevel: capacityLevel,
      is_in_pool: false,
      // Role status - TC007 (Meeting & Training) defaults to COMPLETED, others to NOT_STARTED
      assigneeStatus: taskData.TaskClassID === 'TC007' ? RoleStatus.COMPLETED : RoleStatus.NOT_STARTED,
      checkerStatus: taskData.TaskClassID === 'TC007' ? RoleStatus.COMPLETED : RoleStatus.NOT_STARTED,
      chiefDesignerStatus: taskData.TaskClassID === 'TC007' ? RoleStatus.COMPLETED : RoleStatus.NOT_STARTED,
      approverStatus: taskData.TaskClassID === 'TC007' ? RoleStatus.COMPLETED : RoleStatus.NOT_STARTED
    };

    // Save the new task
    this.saveTask(newTask);

    // Soft delete the pool item
    const itemIndex = poolItems.findIndex(i => i.id === poolItemId);
    if (itemIndex >= 0) {
      poolItems[itemIndex].is_deleted = true;
      localStorage.setItem(STORAGE_KEYS.TASK_POOL, JSON.stringify(poolItems));
    }

    return newTask;
  }

  // Task Category Management
  getTaskCategories(): Record<string, string[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TASK_CATEGORIES);
    if (data) {
      return JSON.parse(data);
    }
    // If not initialized, save default categories to localStorage and return them
    localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(DEFAULT_TASK_CATEGORIES));
    return DEFAULT_TASK_CATEGORIES;
  }

  saveTaskCategory(taskClassCode: string, categories: string[]): void {
    const allCategories = this.getTaskCategories();
    allCategories[taskClassCode] = categories;
    localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(allCategories));
  }

  addTaskCategory(taskClassCode: string, categoryName: string): void {
    const allCategories = this.getTaskCategories();
    if (!allCategories[taskClassCode]) {
      allCategories[taskClassCode] = [];
    }
    if (!allCategories[taskClassCode].includes(categoryName)) {
      allCategories[taskClassCode].push(categoryName);
      localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(allCategories));
    }
  }

  deleteTaskCategory(taskClassCode: string, categoryName: string): void {
    const allCategories = this.getTaskCategories();
    if (allCategories[taskClassCode]) {
      allCategories[taskClassCode] = allCategories[taskClassCode].filter(c => c !== categoryName);
      localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(allCategories));
    }
  }

  updateTaskCategory(taskClassCode: string, oldCategoryName: string, newCategoryName: string): void {
    const allCategories = this.getTaskCategories();
    if (allCategories[taskClassCode]) {
      const index = allCategories[taskClassCode].indexOf(oldCategoryName);
      if (index !== -1) {
        allCategories[taskClassCode][index] = newCategoryName;
        localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(allCategories));
      }
    }
  }

  reorderTaskCategories(taskClassCode: string, newOrder: string[]): void {
    const allCategories = this.getTaskCategories();
    if (allCategories[taskClassCode]) {
      allCategories[taskClassCode] = newOrder;
      localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(allCategories));
    }
  }

  // Auth
  login(userId: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => (u.UserID === userId || u.Name === userId) && u.Password === password);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Password Management
  changePassword(userId: string, currentPassword: string, newPassword: string): boolean {
    const users = this.getAllUsersRaw();
    const user = users.find(u => u.UserID === userId);
    if (!user || user.Password !== currentPassword) {
      return false;
    }
    user.Password = newPassword;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  }

  resetPassword(userId: string, newPassword: string): boolean {
    const users = this.getAllUsersRaw();
    const user = users.find(u => u.UserID === userId);
    if (!user) {
      return false;
    }
    user.Password = newPassword;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  }

  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Avatar Management
  saveAvatar(userId: string, avatarData: string): void {
    const avatars = this.getAllAvatarsRaw();
    avatars[userId] = avatarData;
    localStorage.setItem(STORAGE_KEYS.USER_AVATARS, JSON.stringify(avatars));
  }

  getAvatar(userId: string): string | null {
    const avatars = this.getAllAvatarsRaw();
    return avatars[userId] || null;
  }

  deleteAvatar(userId: string): void {
    const avatars = this.getAllAvatarsRaw();
    delete avatars[userId];
    localStorage.setItem(STORAGE_KEYS.USER_AVATARS, JSON.stringify(avatars));
  }

  private getAllAvatarsRaw(): Record<string, string> {
    const data = localStorage.getItem(STORAGE_KEYS.USER_AVATARS);
    return data ? JSON.parse(data) : {};
  }

  // Equipment Models Management
  getEquipmentModels(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT_MODELS);
    return data ? JSON.parse(data) : [];
  }

  saveEquipmentModel(model: string): void {
    const models = this.getEquipmentModels();
    if (!models.includes(model)) {
      models.push(model);
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT_MODELS, JSON.stringify(models));
    }
  }

  deleteEquipmentModel(model: string): void {
    const models = this.getEquipmentModels();
    const index = models.indexOf(model);
    if (index >= 0) {
      models.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT_MODELS, JSON.stringify(models));
    }
  }

  // Capacity Levels Management
  getCapacityLevels(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.CAPACITY_LEVELS);
    return data ? JSON.parse(data) : [];
  }

  saveCapacityLevel(level: string): void {
    const levels = this.getCapacityLevels();
    if (!levels.includes(level)) {
      levels.push(level);
      localStorage.setItem(STORAGE_KEYS.CAPACITY_LEVELS, JSON.stringify(levels));
    }
  }

  deleteCapacityLevel(level: string): void {
    const levels = this.getCapacityLevels();
    const index = levels.indexOf(level);
    if (index >= 0) {
      levels.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.CAPACITY_LEVELS, JSON.stringify(levels));
    }
  }

  // Travel Labels Management
  getTravelLabels(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRAVEL_LABELS);
    return data ? JSON.parse(data) : [];
  }

  saveTravelLabel(label: string): void {
    const labels = this.getTravelLabels();
    if (!labels.includes(label)) {
      labels.push(label);
      localStorage.setItem(STORAGE_KEYS.TRAVEL_LABELS, JSON.stringify(labels));
    }
  }

  deleteTravelLabel(label: string): void {
    const labels = this.getTravelLabels();
    const index = labels.indexOf(label);
    if (index >= 0) {
      labels.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.TRAVEL_LABELS, JSON.stringify(labels));
    }
  }

  // Initialize default settings from existing data
  initializeSettings(): void {
    // Initialize Equipment Models with default values if not exist
    if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT_MODELS)) {
      const defaultModels = [
        'Francis',
        'Pelton',
        'Kaplan',
        'Nuclear Steam Turbine',
        'CAP1400',
        'HTR Steam Turbine',
        'AP1000',
        'Pump-Turbine',
        'Rotary'
      ];
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT_MODELS, JSON.stringify(defaultModels));
    }

    // Initialize Capacity Levels with default values if not exist
    if (!localStorage.getItem(STORAGE_KEYS.CAPACITY_LEVELS)) {
      const defaultLevels = [
        '50MW',
        '100MW',
        '170MW',
        '200MW',
        '300MW',
        '400MW',
        '500MW',
        '550MW',
        '600MW',
        '700MW',
        '770MW',
        '800MW',
        '850MW',
        '1000MW',
        '1100MW',
        '1200MW',
        '1400MW'
      ];
      localStorage.setItem(STORAGE_KEYS.CAPACITY_LEVELS, JSON.stringify(defaultLevels));
    }

    // Initialize Travel Labels from existing task categories
    if (!localStorage.getItem(STORAGE_KEYS.TRAVEL_LABELS)) {
      const tasks = this.getTasks();
      const travelTasks = tasks.filter(t => t.TaskClassID === 'TC009'); // Travel tasks
      const labels = [...new Set(travelTasks.map(t => t.Category))];
      localStorage.setItem(STORAGE_KEYS.TRAVEL_LABELS, JSON.stringify(labels));
    }
  }

  // --- Personal Workspace Methods ---

  // Get tasks where user has any role (assignee, checker, chiefDesigner, or approver)
  getPersonalTasks(userId: string): Task[] {
    const tasks = this.getTasks();
    return tasks.filter(t =>
      t.AssigneeID === userId ||
      t.CheckerID === userId ||
      t.ChiefDesignerID === userId ||
      t.ApproverID === userId
    );
  }

  // Separate tasks by status
  separateTasksByStatus(tasks: Task[]): SeparatedTasks {
    return {
      inProgress: tasks.filter(t =>
        t.Status === TaskStatus.DRAFTING ||
        t.Status === TaskStatus.REVISING ||
        t.Status === TaskStatus.REVIEWING ||
        t.Status === TaskStatus.REVIEWING2
      ),
      pending: tasks.filter(t => t.Status === TaskStatus.NOT_STARTED),
      completed: tasks.filter(t => t.Status === TaskStatus.COMPLETED)
    };
  }

  // Get role status for a specific user in a task
  getRoleStatusForUser(task: Task, userId: string): RoleStatus {
    if (task.AssigneeID === userId) return task.assigneeStatus || RoleStatus.NOT_STARTED;
    if (task.CheckerID === userId) return task.checkerStatus || RoleStatus.NOT_STARTED;
    if (task.ChiefDesignerID === userId) return task.chiefDesignerStatus || RoleStatus.NOT_STARTED;
    if (task.ApproverID === userId) return task.approverStatus || RoleStatus.NOT_STARTED;
    return RoleStatus.NOT_STARTED;
  }

  // Separate tasks by user's role status (for personal workspace)
  separateTasksByRoleStatus(tasks: Task[], userId: string): SeparatedTasks {
    // Filter out TC007 (Meeting) and TC009 (Travel) - they are shown separately
    const regularTasks = tasks.filter(t => t.TaskClassID !== 'TC007' && t.TaskClassID !== 'TC009');

    const inProgressStatuses = [RoleStatus.IN_PROGRESS, RoleStatus.REVISING, RoleStatus.REJECTED];

    const inProgress = regularTasks.filter(t => {
      const status = this.getRoleStatusForUser(t, userId);
      return inProgressStatuses.includes(status);
    });

    const pending = regularTasks.filter(t => {
      const status = this.getRoleStatusForUser(t, userId);
      return status === RoleStatus.NOT_STARTED;
    });

    const completed = regularTasks.filter(t => {
      const status = this.getRoleStatusForUser(t, userId);
      return status === RoleStatus.COMPLETED;
    });

    return { inProgress, pending, completed };
  }

  // Get travel tasks (TC009) for a user
  getTravelTasks(userId: string): Task[] {
    const tasks = this.getPersonalTasks(userId);
    return tasks.filter(t => t.TaskClassID === 'TC009');
  }

  // Get meeting tasks (TC007) for a user - only show if user is in Participants
  getMeetingTasks(userId: string): Task[] {
    const tasks = this.getPersonalTasks(userId);
    return tasks.filter(t =>
      t.TaskClassID === 'TC007' &&
      t.Participants &&
      t.Participants.includes(userId)
    );
  }

  // Calculate work days in a period
  getWorkDaysInPeriod(period: Period): WorkDayInfo {
    const now = new Date();
    let startDate: Date;
    let workDays = 0;

    switch (period) {
      case 'week':
        // 本周 - 从本周一算起
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay() + 1);
        break;
      case 'month':
        // 本月 - 从本月第一天算起
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        // 近三个月
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'halfYear':
        // 近半年
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        // 本年度 - 从今年第一天算起
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'yearAndHalf':
        // 近一年半
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 18);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Count work days (Monday to Friday)
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday or Sunday
        workDays++;
      }
    }

    return {
      workDays,
      workHours: workDays * 8
    };
  }

  // Check if a task is long-running (over 2 months)
  isTaskLongRunning(task: Task): boolean {
    const now = new Date();
    const createdDate = new Date(task.CreatedDate);
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(now.getMonth() - 2);

    // Check if created more than 2 months ago AND not completed
    if (createdDate <= twoMonthsAgo && task.Status !== TaskStatus.COMPLETED) {
      return true;
    }

    // Check if start date is more than 2 months ago AND status is pending
    if (task.StartDate) {
      const startDate = new Date(task.StartDate);
      if (startDate <= twoMonthsAgo && task.Status === TaskStatus.NOT_STARTED) {
        return true;
      }
    }

    return false;
  }

  // Filter tasks by period based on CreatedDate
  filterTasksByPeriod(tasks: Task[], period: Period): Task[] {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        // 本周 - 从本周一算起
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay() + 1);
        break;
      case 'month':
        // 本月 - 从本月第一天算起
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        // 近三个月
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'halfYear':
        // 近半年
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        // 本年度 - 从今年第一天算起
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'yearAndHalf':
        // 近一年半
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 18);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return tasks.filter(t => new Date(t.CreatedDate) >= startDate);
  }

  // Filter tasks by period based on StartDate (for task lists)
  filterTasksByStartDate(tasks: Task[], period: Period): Task[] {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        // 本周 - 从本周一算起
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay() + 1);
        break;
      case 'month':
        // 本月 - 从本月第一天算起
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        // 近三个月
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'halfYear':
        // 近半年
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        // 本年度 - 从今年第一天算起
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'yearAndHalf':
        // 近一年半
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 18);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return tasks.filter(t => {
      if (!t.StartDate) return false;
      return new Date(t.StartDate) >= startDate;
    });
  }

  // Calculate personal statistics
  calculatePersonalStats(tasks: Task[], period: Period, userId?: string): PersonalStats {
    // Filter tasks by period
    const periodTasks = this.filterTasksByPeriod(tasks, period);

    // Get work days info
    const workDaysInfo = this.getWorkDaysInPeriod(period);

    // Separate by status (use role status if userId provided)
    let inProgress: Task[], pending: Task[], completed: Task[];
    if (userId) {
      const separated = this.separateTasksByRoleStatus(periodTasks, userId);
      inProgress = separated.inProgress;
      pending = separated.pending;
      completed = separated.completed;
    } else {
      const separated = this.separateTasksByStatus(periodTasks);
      inProgress = separated.inProgress;
      pending = separated.pending;
      completed = separated.completed;
    }

    // Calculate category distribution (excluding TC009/TC007) - based on role status filtered tasks
    const allFilteredTasks = [...inProgress, ...pending, ...completed];
    const categoryTasks = allFilteredTasks.filter(t => t.TaskClassID !== 'TC009' && t.TaskClassID !== 'TC007');
    const categoryMap = new Map<string, number>();

    categoryTasks.forEach(t => {
      const taskClass = this.getTaskClasses().find(tc => tc.id === t.TaskClassID);
      const name = taskClass?.name || t.TaskClassID;
      categoryMap.set(name, (categoryMap.get(name) || 0) + 1);
    });

    const totalCategoryTasks = categoryTasks.length;
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
      percentage: totalCategoryTasks > 0 ? Math.round((count / totalCategoryTasks) * 100) : 0
    }));

    // Calculate travel stats (TC009) - based on periodTasks (not filtered tasks)
    const travelTasks = periodTasks.filter(t => t.TaskClassID === 'TC009');
    const totalTravelDays = travelTasks.reduce((sum, t) => sum + (t.TravelDuration || 0), 0);

    // Calculate meeting stats (TC007) - based on periodTasks (not filtered tasks)
    const meetingTasks = periodTasks.filter(t => t.TaskClassID === 'TC007');
    const totalMeetingHours = meetingTasks.reduce((sum, t) => sum + (t.MeetingDuration || 0), 0);

    const totalCount = inProgress.length + pending.length + completed.length;
    const completionRate = totalCount > 0 ? Math.round((completed.length / totalCount) * 100) : 0;

    // Calculate monthly trend if userId is provided
    const monthlyTrend = userId ? this.calculateMonthlyTrend(periodTasks, 6, userId) : [];

    return {
      inProgressCount: inProgress.length,
      pendingCount: pending.length,
      completedCount: completed.length,
      totalCount,
      completionRate,
      categoryDistribution,
      travelStats: {
        totalDays: totalTravelDays,
        workHoursInPeriod: workDaysInfo.workHours,
        percentage: workDaysInfo.workHours > 0 ? Math.round((totalTravelDays / workDaysInfo.workHours) * 100) : 0
      },
      meetingStats: {
        totalHours: totalMeetingHours,
        workHoursInPeriod: workDaysInfo.workHours,
        percentage: workDaysInfo.workHours > 0 ? Math.round((totalMeetingHours / workDaysInfo.workHours) * 100) : 0
      },
      monthlyTrend
    };
  }

  // Calculate monthly task trend for personal workspace
  calculateMonthlyTrend(tasks: Task[], months: number, userId: string): { month: string; assigned: number; completed: number }[] {
    const result: { month: string; assigned: number; completed: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Count assigned tasks (where user is assignee, checker, chiefDesigner, or approver)
      const assignedCount = tasks.filter(t => {
        const createdDate = new Date(t.CreatedDate);
        return createdDate >= date && createdDate < nextMonth &&
          (t.AssigneeID === userId || t.CheckerID === userId || t.ChiefDesignerID === userId || t.ApproverID === userId);
      }).length;

      // Count completed tasks
      const completedCount = tasks.filter(t => {
        const completedDate = t.CompletedDate ? new Date(t.CompletedDate) : null;
        return completedDate && completedDate >= date && completedDate < nextMonth &&
          (t.AssigneeID === userId || t.CheckerID === userId || t.ChiefDesignerID === userId || t.ApproverID === userId);
      }).length;

      result.push({ month: monthStr, assigned: assignedCount, completed: completedCount });
    }

    return result;
  }

  // Calculate daily task trend for personal workspace (for week/month period)
  calculateDailyTrend(tasks: Task[], days: number, userId: string): { month: string; assigned: number; completed: number }[] {
    const result: { month: string; assigned: number; completed: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      // Set to start of day
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      // Set to start of next day
      nextDate.setHours(0, 0, 0, 0);

      const dayStr = `${date.getMonth() + 1}/${date.getDate()}`;

      // Count assigned tasks
      const assignedCount = tasks.filter(t => {
        const createdDate = new Date(t.CreatedDate);
        return createdDate >= date && createdDate < nextDate &&
          (t.AssigneeID === userId || t.CheckerID === userId || t.ChiefDesignerID === userId || t.ApproverID === userId);
      }).length;

      // Count completed tasks
      const completedCount = tasks.filter(t => {
        const completedDate = t.CompletedDate ? new Date(t.CompletedDate) : null;
        return completedDate && completedDate >= date && completedDate < nextDate &&
          (t.AssigneeID === userId || t.CheckerID === userId || t.ChiefDesignerID === userId || t.ApproverID === userId);
      }).length;

      result.push({ month: dayStr, assigned: assignedCount, completed: completedCount });
    }

    return result;
  }

  // Retrieve a task back to the pool (LEADER/ADMIN only)
  // 回收任务时，清空负责人、校核人、主任设计、审查人的所有信息
  retrieveTaskToPool(taskId: string): void {
    const tasks = this.getAllTasksRaw();
    const task = tasks.find(t => t.TaskID === taskId);

    if (task) {
      task.is_in_pool = true;
      task.AssigneeID = undefined;
      task.AssigneeName = undefined;
      task.CheckerID = undefined;
      task.CheckerName = undefined;
      task.ChiefDesignerID = undefined;
      task.ChiefDesignerName = undefined;
      task.ApproverID = undefined;
      task.ApproverName = undefined;
      task.ProjectID = undefined;
      // 重置任务状态和角色状态
      task.Status = TaskStatus.NOT_STARTED;
      task.assigneeStatus = undefined;
      task.checkerStatus = undefined;
      task.chiefDesignerStatus = undefined;
      task.approverStatus = undefined;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  // Get team members for user switcher (excluding current user)
  getTeamMembers(currentUserId: string): User[] {
    const users = this.getUsers();
    return users.filter(u => u.UserID !== currentUserId);
  }

  // Generate CSV export data
  generateStatsCSV(stats: PersonalStats, separatedTasks: SeparatedTasks, userName: string): string {
    const lines: string[] = [];

    // Header
    lines.push(`个人工作台统计报表 - ${userName}`);
    lines.push(`导出时间: ${new Date().toLocaleString()}`);
    lines.push('');

    // Task summary
    lines.push('任务概览');
    lines.push(`进行中,${stats.inProgressCount}`);
    lines.push(`未开始,${stats.pendingCount}`);
    lines.push(`已完成,${stats.completedCount}`);
    lines.push(`总计,${stats.totalCount}`);
    lines.push(`完成率,${stats.completionRate}%`);
    lines.push('');

    // Travel stats
    lines.push('差旅统计');
    lines.push(`出差天数,${stats.travelStats.totalDays}天`);
    lines.push(`占工作时长,${stats.travelStats.percentage}%`);
    lines.push('');

    // Meeting stats
    lines.push('会议统计');
    lines.push(`会议时长,${stats.meetingStats.totalHours}小时`);
    lines.push(`占工作时长,${stats.meetingStats.percentage}%`);
    lines.push('');

    // Category distribution
    lines.push('类别分布');
    stats.categoryDistribution.forEach(cat => {
      lines.push(`${cat.name},${cat.count}个,${cat.percentage}%`);
    });
    lines.push('');

    // Task lists
    lines.push('进行中任务');
    lines.push('任务名称,类别,开始时间,截止时间');
    separatedTasks.inProgress.forEach(t => {
      lines.push(`"${t.TaskName}",${t.Category},${t.StartDate || ''},${t.DueDate || ''}`);
    });
    lines.push('');

    lines.push('未开始任务');
    lines.push('任务名称,类别,开始时间,截止时间');
    separatedTasks.pending.forEach(t => {
      lines.push(`"${t.TaskName}",${t.Category},${t.StartDate || ''},${t.DueDate || ''}`);
    });
    lines.push('');

    lines.push('已完成任务');
    lines.push('任务名称,类别,开始时间,截止时间');
    separatedTasks.completed.forEach(t => {
      lines.push(`"${t.TaskName}",${t.Category},${t.StartDate || ''},${t.DueDate || ''}`);
    });

    return lines.join('\n');
  }

  // Download CSV file
  downloadStatsCSV(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Auto-calculates task status based on role statuses
  calculateTaskStatus(task: Task): TaskStatus {
    // If task is completed, return COMPLETED
    if (task.Status === TaskStatus.COMPLETED) {
      return TaskStatus.COMPLETED;
    }

    // All completed - calculate based on role statuses
    const assigneeCompleted = task.assigneeStatus === RoleStatus.COMPLETED;
    const checkerCompleted = !task.CheckerID || task.checkerStatus === RoleStatus.COMPLETED;
    const chiefDesignerCompleted = !task.ChiefDesignerID || task.chiefDesignerStatus === RoleStatus.COMPLETED;
    const approverCompleted = !task.ApproverID || task.approverStatus === RoleStatus.COMPLETED;

    if (assigneeCompleted && checkerCompleted && chiefDesignerCompleted && approverCompleted) {
      return TaskStatus.COMPLETED;
    }

    // Rejected status has priority (highest to lowest: approver -> chiefDesigner -> checker)
    if (task.approverStatus === RoleStatus.REJECTED) return TaskStatus.REVIEWING2;
    if (task.chiefDesignerStatus === RoleStatus.REJECTED) return TaskStatus.REVIEWING2;
    if (task.checkerStatus === RoleStatus.REJECTED) return TaskStatus.REVIEWING;
    if (task.assigneeStatus === RoleStatus.REJECTED || task.assigneeStatus === RoleStatus.REVISING) {
      return TaskStatus.REVISING;
    }

    // In progress status (highest to lowest: approver -> chiefDesigner -> checker -> assignee)
    if (task.approverStatus === RoleStatus.IN_PROGRESS) return TaskStatus.REVIEWING2;
    if (task.chiefDesignerStatus === RoleStatus.IN_PROGRESS) return TaskStatus.REVIEWING2;
    if (task.checkerStatus === RoleStatus.IN_PROGRESS) return TaskStatus.REVIEWING;
    if (task.assigneeStatus === RoleStatus.IN_PROGRESS) return TaskStatus.DRAFTING;

    // Default to NOT_STARTED
    return TaskStatus.NOT_STARTED;
  }

  // Returns true for LEADER or ADMIN roles
  canViewWorkload(user: SystemRole): boolean {
    return user === SystemRole.LEADER || user === SystemRole.ADMIN;
  }

  // Migrates old field names to new ones for existing data
  migrateTaskStatusFields(): void {
    const tasks = this.getAllTasksRaw();
    let hasChanges = false;

    tasks.forEach((task: any) => {
      // Migrate field names from old to new
      if ('ReviewerID' in task && !('CheckerID' in task)) {
        task.CheckerID = task.ReviewerID;
        delete task.ReviewerID;
        hasChanges = true;
      }

      if ('ReviewerID2' in task && !('ApproverID' in task)) {
        task.ApproverID = task.ReviewerID2;
        delete task.ReviewerID2;
        hasChanges = true;
      }

      if ('ReviewerName' in task && !('CheckerName' in task)) {
        task.CheckerName = task.ReviewerName;
        delete task.ReviewerName;
        hasChanges = true;
      }

      if ('Reviewer2Name' in task && !('ApproverName' in task)) {
        task.ApproverName = task.Reviewer2Name;
        delete task.Reviewer2Name;
        hasChanges = true;
      }

      if ('ReviewerWorkload' in task && !('CheckerWorkload' in task)) {
        task.CheckerWorkload = task.ReviewerWorkload;
        delete task.ReviewerWorkload;
        hasChanges = true;
      }

      if ('Reviewer2Workload' in task && !('ApproverWorkload' in task)) {
        task.ApproverWorkload = task.Reviewer2Workload;
        delete task.Reviewer2Workload;
        hasChanges = true;
      }

      // Migrate role status fields if not present
      if (!('assigneeStatus' in task) && task.AssigneeID) {
        task.assigneeStatus = RoleStatus.NOT_STARTED;
        hasChanges = true;
      }
      if (!('checkerStatus' in task) && task.CheckerID) {
        task.checkerStatus = RoleStatus.NOT_STARTED;
        hasChanges = true;
      }
      if (!('chiefDesignerStatus' in task) && task.ChiefDesignerID) {
        task.chiefDesignerStatus = RoleStatus.NOT_STARTED;
        hasChanges = true;
      }
      if (!('approverStatus' in task) && task.ApproverID) {
        task.approverStatus = RoleStatus.NOT_STARTED;
        hasChanges = true;
      }
    });

    // Save changes if any were made
    if (hasChanges) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  // Helpers
  generateId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }
}

export const dataService = new DataService();
