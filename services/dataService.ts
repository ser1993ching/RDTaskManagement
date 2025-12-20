import { User, Project, Task, TaskClass, SystemRole, OfficeLocation, PersonnelStatus, ProjectCategory, TaskStatus } from '../types';

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
  TASK_CATEGORIES: 'rd_task_categories'
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
  'TRAVEL': ['市场配合出差', '常规项目出差', '核电项目出差', '产品研发出差', '科研出差', '生产服务出差', '其他'],
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

const seedTaskClasses: TaskClass[] = [
  {
    id: 'TC001',
    name: '市场配合',
    code: 'MARKET',
    description: '市场配合相关任务'
  },
  {
    id: 'TC002',
    name: '常规项目执行',
    code: 'EXECUTION',
    description: '常规项目执行相关任务'
  },
  {
    id: 'TC003',
    name: '核电项目执行',
    code: 'NUCLEAR',
    description: '核电项目执行相关任务'
  },
  {
    id: 'TC004',
    name: '产品研发',
    code: 'PRODUCT_DEV',
    description: '产品研发相关任务'
  },
  {
    id: 'TC005',
    name: '科研任务',
    code: 'RESEARCH',
    description: '科研任务相关工作'
  },
  {
    id: 'TC006',
    name: '改造服务',
    code: 'RENOVATION',
    description: '改造服务相关任务'
  },
  {
    id: 'TC008',
    name: '行政与党建',
    code: 'ADMIN_PARTY',
    description: '行政与党建相关工作'
  },
  {
    id: 'TC007',
    name: '内部会议与培训',
    code: 'MEETING_TRAINING',
    description: '内部会议与培训相关工作'
  },
  {
    id: 'TC009',
    name: '差旅任务',
    code: 'TRAVEL',
    description: '差旅相关任务'
  },
  {
    id: 'TC010',
    name: '其他任务',
    code: 'OTHER',
    description: '其他类型任务'
  }
];

const seedTasks: Task[] = [
  // 市场配合任务 (TC001) - 对应P001-P005
  {
    TaskID: 'T-20250105-001',
    TaskName: '某国外抽水蓄能电站投标项目-技术方案',
    TaskClassID: 'TC001',
    Category: '技术方案',
    ProjectID: 'P001',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 8,
    Difficulty: 1.5,
    CapacityLevel: '1200MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER003',
    StartDate: '2025-01-15',
    CreatedDate: '2025-01-15',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250120-002',
    TaskName: '某国外抽水蓄能电站投标项目-标书制作',
    TaskClassID: 'TC001',
    Category: '标书',
    ProjectID: 'P001',
    AssigneeID: 'LEADER001',
    Status: TaskStatus.COMPLETED,
    Workload: 15,
    Difficulty: 1.8,
    CapacityLevel: '1200MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER007',
    StartDate: '2025-01-20',
    CreatedDate: '2025-01-20',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250201-003',
    TaskName: '国内大型水电站投标项目-复询',
    TaskClassID: 'TC001',
    Category: '复询',
    ProjectID: 'P002',
    AssigneeID: 'USER003',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 5,
    Difficulty: 1.2,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-02-10',
    CreatedDate: '2025-02-10',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250215-004',
    TaskName: '国内大型水电站投标项目-技术交流',
    TaskClassID: 'TC001',
    Category: '其他',
    ProjectID: 'P002',
    AssigneeID: 'USER002',
    Status: TaskStatus.COMPLETED,
    Workload: 6,
    Difficulty: 1.0,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-02-15',
    CreatedDate: '2025-02-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250305-005',
    TaskName: '海外小水电投标项目-标书',
    TaskClassID: 'TC001',
    Category: '标书',
    ProjectID: 'P003',
    AssigneeID: 'USER004',
    Status: TaskStatus.NOT_STARTED,
    Workload: 10,
    Difficulty: 1.3,
    CapacityLevel: '50MW',
    ReviewerID: 'USER006',
    ReviewerID2: 'USER007',
    StartDate: '2025-03-05',
    CreatedDate: '2025-03-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250310-006',
    TaskName: '一带一路水电项目投标-技术方案',
    TaskClassID: 'TC001',
    Category: '技术方案',
    ProjectID: 'P004',
    AssigneeID: 'USER005',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 12,
    Difficulty: 1.6,
    CapacityLevel: '800MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-03-10',
    CreatedDate: '2025-03-10',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250401-007',
    TaskName: '抽水蓄能电站技术方案项目-复询',
    TaskClassID: 'TC001',
    Category: '复询',
    ProjectID: 'P005',
    AssigneeID: 'LEADER001',
    Status: TaskStatus.COMPLETED,
    Workload: 4,
    Difficulty: 1.0,
    CapacityLevel: '600MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER003',
    StartDate: '2025-04-01',
    CreatedDate: '2025-04-01',
    CreatedBy: 'admin'
  },

  // 常规项目任务 (TC002) - 对应P006-P010
  {
    TaskID: 'T-20250105-010',
    TaskName: '白鹤滩水电站左岸机组制造-设计院提资',
    TaskClassID: 'TC002',
    Category: '设计院提资',
    ProjectID: 'P006',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 10,
    Difficulty: 1.8,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER007',
    StartDate: '2025-01-05',
    CreatedDate: '2025-01-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250201-011',
    TaskName: '白鹤滩水电站左岸机组制造-CT配合与提资',
    TaskClassID: 'TC002',
    Category: 'CT配合与提资',
    ProjectID: 'P006',
    AssigneeID: 'USER002',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 8,
    Difficulty: 1.5,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER003',
    StartDate: '2025-02-01',
    CreatedDate: '2025-02-01',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250215-012',
    TaskName: '溪洛渡水电站机组改造项目-搭建生产资料',
    TaskClassID: 'TC002',
    Category: '搭建生产资料',
    ProjectID: 'P007',
    AssigneeID: 'USER003',
    Status: TaskStatus.COMPLETED,
    Workload: 7,
    Difficulty: 1.3,
    CapacityLevel: '770MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-02-15',
    CreatedDate: '2025-02-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250310-013',
    TaskName: '向家坝水电站优化项目-项目特殊项处理',
    TaskClassID: 'TC002',
    Category: '项目特殊项处理',
    ProjectID: 'P008',
    AssigneeID: 'USER004',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 9,
    Difficulty: 1.6,
    CapacityLevel: '600MW',
    ReviewerID: 'USER006',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-03-10',
    CreatedDate: '2025-03-10',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250320-014',
    TaskName: '乌东德水电站维护项目-用户配合',
    TaskClassID: 'TC002',
    Category: '用户配合',
    ProjectID: 'P009',
    AssigneeID: 'USER005',
    Status: TaskStatus.COMPLETED,
    Workload: 6,
    Difficulty: 1.2,
    CapacityLevel: '850MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    StartDate: '2025-03-20',
    CreatedDate: '2025-03-20',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250405-015',
    TaskName: '龙滩水电站扩建项目-图纸会签',
    TaskClassID: 'TC002',
    Category: '图纸会签',
    ProjectID: 'P010',
    AssigneeID: 'USER006',
    Status: TaskStatus.NOT_STARTED,
    Workload: 11,
    Difficulty: 1.7,
    CapacityLevel: '700MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER003',
    StartDate: '2025-04-05',
    CreatedDate: '2025-04-05',
    CreatedBy: 'LEADER001'
  },

  // 核电项目任务 (TC003) - 对应P011-P015
  {
    TaskID: 'T-20250110-020',
    TaskName: '华龙一号常规岛设计项目-核电设计',
    TaskClassID: 'TC003',
    Category: '核电设计',
    ProjectID: 'P011',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 15,
    Difficulty: 2.0,
    CapacityLevel: '1200MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER007',
    StartDate: '2025-01-10',
    CreatedDate: '2025-01-10',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250201-021',
    TaskName: '华龙一号常规岛设计项目-核岛接口',
    TaskClassID: 'TC003',
    Category: '核岛接口',
    ProjectID: 'P011',
    AssigneeID: 'USER002',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 12,
    Difficulty: 1.8,
    CapacityLevel: '1200MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER003',
    StartDate: '2025-02-01',
    CreatedDate: '2025-02-01',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250215-022',
    TaskName: 'CAP1400核电项目配合-核安全审查',
    TaskClassID: 'TC003',
    Category: '核安全审查',
    ProjectID: 'P012',
    AssigneeID: 'USER003',
    Status: TaskStatus.COMPLETED,
    Workload: 10,
    Difficulty: 1.9,
    CapacityLevel: '1400MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-02-15',
    CreatedDate: '2025-02-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250315-023',
    TaskName: '某核电站汽轮机改造项目-设备调试',
    TaskClassID: 'TC003',
    Category: '设备调试',
    ProjectID: 'P013',
    AssigneeID: 'USER004',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 9,
    Difficulty: 1.6,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER006',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-03-15',
    CreatedDate: '2025-03-15',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250401-024',
    TaskName: '高温气冷堆常规岛项目-技术方案',
    TaskClassID: 'TC003',
    Category: '技术方案',
    ProjectID: 'P014',
    AssigneeID: 'USER005',
    Status: TaskStatus.NOT_STARTED,
    Workload: 13,
    Difficulty: 1.9,
    CapacityLevel: '200MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    StartDate: '2025-04-01',
    CreatedDate: '2025-04-01',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250410-025',
    TaskName: '核电设备国产化项目-常规岛配合',
    TaskClassID: 'TC003',
    Category: '常规岛配合',
    ProjectID: 'P015',
    AssigneeID: 'USER006',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 11,
    Difficulty: 1.7,
    CapacityLevel: '1100MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER003',
    StartDate: '2025-04-10',
    CreatedDate: '2025-04-10',
    CreatedBy: 'LEADER001'
  },

  // 科研项目任务 (TC005) - 对应P016-P020
  {
    TaskID: 'T-20250108-030',
    TaskName: '新型水轮机叶片材料研发-技术方案',
    TaskClassID: 'TC005',
    Category: '技术方案',
    ProjectID: 'P016',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 12,
    Difficulty: 1.8,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER007',
    StartDate: '2025-01-08',
    CreatedDate: '2025-01-08',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250220-031',
    TaskName: '新型水轮机叶片材料研发-专利申请',
    TaskClassID: 'TC005',
    Category: '专利申请',
    ProjectID: 'P016',
    AssigneeID: 'USER002',
    Status: TaskStatus.NOT_STARTED,
    Workload: 6,
    Difficulty: 1.3,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER003',
    StartDate: '2025-02-20',
    CreatedDate: '2025-02-20',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250301-032',
    TaskName: '水电站智能化运维系统研发-设计流程',
    TaskClassID: 'TC005',
    Category: '设计流程',
    ProjectID: 'P017',
    AssigneeID: 'USER003',
    Status: TaskStatus.COMPLETED,
    Workload: 8,
    Difficulty: 1.5,
    CapacityLevel: '500MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-03-01',
    CreatedDate: '2025-03-01',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250315-033',
    TaskName: '水轮机增容改造技术研究-方案评审',
    TaskClassID: 'TC005',
    Category: '方案评审',
    ProjectID: 'P018',
    AssigneeID: 'USER004',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 7,
    Difficulty: 1.4,
    CapacityLevel: '700MW',
    ReviewerID: 'USER006',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-03-15',
    CreatedDate: '2025-03-15',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250401-034',
    TaskName: '绿色能源储能技术研发-开题报告',
    TaskClassID: 'TC005',
    Category: '开题报告',
    ProjectID: 'P019',
    AssigneeID: 'USER005',
    Status: TaskStatus.NOT_STARTED,
    Workload: 5,
    Difficulty: 1.2,
    CapacityLevel: '300MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    StartDate: '2025-04-01',
    CreatedDate: '2025-04-01',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250410-035',
    TaskName: '水电机组振动控制技术研发-设计总结',
    TaskClassID: 'TC005',
    Category: '设计总结',
    ProjectID: 'P020',
    AssigneeID: 'USER006',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 9,
    Difficulty: 1.6,
    CapacityLevel: '800MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER003',
    StartDate: '2025-04-10',
    CreatedDate: '2025-04-10',
    CreatedBy: 'LEADER001'
  },

  // 改造项目任务 (TC006) - 对应P021-P025
  {
    TaskID: 'T-20250112-040',
    TaskName: '三峡左岸机组改造升级-方案编制',
    TaskClassID: 'TC006',
    Category: '方案编制',
    ProjectID: 'P021',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 10,
    Difficulty: 1.7,
    CapacityLevel: '700MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER007',
    StartDate: '2025-01-12',
    CreatedDate: '2025-01-12',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250225-041',
    TaskName: '葛洲坝水电站机电改造-前期项目配合',
    TaskClassID: 'TC006',
    Category: '前期项目配合',
    ProjectID: 'P022',
    AssigneeID: 'USER002',
    Status: TaskStatus.NOT_STARTED,
    Workload: 8,
    Difficulty: 1.4,
    CapacityLevel: '170MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER003',
    StartDate: '2025-02-25',
    CreatedDate: '2025-02-25',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250315-042',
    TaskName: '小浪底水电站设备更新-方案编制',
    TaskClassID: 'TC006',
    Category: '方案编制',
    ProjectID: 'P023',
    AssigneeID: 'USER003',
    Status: TaskStatus.COMPLETED,
    Workload: 9,
    Difficulty: 1.5,
    CapacityLevel: '300MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-03-15',
    CreatedDate: '2025-03-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250401-043',
    TaskName: '二滩水电站自动化改造-前期项目配合',
    TaskClassID: 'TC006',
    Category: '前期项目配合',
    ProjectID: 'P024',
    AssigneeID: 'USER004',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 7,
    Difficulty: 1.3,
    CapacityLevel: '550MW',
    ReviewerID: 'USER006',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-04-01',
    CreatedDate: '2025-04-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250408-044',
    TaskName: '水口水电站增效扩容改造-方案编制',
    TaskClassID: 'TC006',
    Category: '方案编制',
    ProjectID: 'P025',
    AssigneeID: 'USER005',
    Status: TaskStatus.NOT_STARTED,
    Workload: 11,
    Difficulty: 1.8,
    CapacityLevel: '200MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    StartDate: '2025-04-08',
    CreatedDate: '2025-04-08',
    CreatedBy: 'admin'
  },

  // 内部会议与培训任务 (TC007) - 无特定项目
  {
    TaskID: 'T-20250115-050',
    TaskName: '月度技术评审会-设计评审会',
    TaskClassID: 'TC007',
    Category: '设计评审会',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.COMPLETED,
    Workload: 3,
    Difficulty: 0.5,
    CapacityLevel: 'N/A',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-01-15',
    CreatedDate: '2025-01-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250201-051',
    TaskName: '新员工入职培训-学习与培训',
    TaskClassID: 'TC007',
    Category: '学习与培训',
    ProjectID: undefined,
    AssigneeID: 'USER003',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 4,
    Difficulty: 0.8,
    CapacityLevel: 'N/A',
    ReviewerID: 'USER006',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-02-01',
    CreatedDate: '2025-02-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250215-052',
    TaskName: '党支部会议-党建会议',
    TaskClassID: 'TC007',
    Category: '党建会议',
    ProjectID: undefined,
    AssigneeID: 'USER002',
    Status: TaskStatus.COMPLETED,
    Workload: 2,
    Difficulty: 0.3,
    CapacityLevel: 'N/A',
    ReviewerID: 'LEADER001',
    ReviewerID2: 'USER007',
    StartDate: '2025-02-15',
    CreatedDate: '2025-02-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250301-053',
    TaskName: '技术讨论会-资料讨论会',
    TaskClassID: 'TC007',
    Category: '资料讨论会',
    ProjectID: 'P001',
    AssigneeID: 'USER004',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 2,
    Difficulty: 0.5,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-03-01',
    CreatedDate: '2025-03-01',
    CreatedBy: 'LEADER001'
  },

  // 行政与党建任务 (TC008) - 无特定项目
  {
    TaskID: 'T-20250105-060',
    TaskName: '月度工作报表-报表填报',
    TaskClassID: 'TC008',
    Category: '报表填报',
    ProjectID: undefined,
    AssigneeID: 'USER006',
    Status: TaskStatus.COMPLETED,
    Workload: 2,
    Difficulty: 0.5,
    CapacityLevel: 'N/A',
    ReviewerID: 'USER001',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-01-05',
    CreatedDate: '2025-01-05',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250210-061',
    TaskName: '年度总结汇报-ppt汇报',
    TaskClassID: 'TC008',
    Category: 'ppt汇报',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.COMPLETED,
    Workload: 6,
    Difficulty: 1.2,
    CapacityLevel: 'N/A',
    ReviewerID: 'admin',
    ReviewerID2: 'USER007',
    StartDate: '2025-02-10',
    CreatedDate: '2025-02-10',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250315-062',
    TaskName: '项目总结报告-总结报告',
    TaskClassID: 'TC008',
    Category: '总结报告',
    ProjectID: 'P006',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 5,
    Difficulty: 1.0,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-03-15',
    CreatedDate: '2025-03-15',
    CreatedBy: 'LEADER001'
  },

  // 差旅任务 (TC009) - 无特定项目
  {
    TaskID: 'T-20250120-070',
    TaskName: '市场配合出差-市场配合出差',
    TaskClassID: 'TC009',
    Category: '市场配合出差',
    ProjectID: 'P001',
    AssigneeID: 'USER003',
    Status: TaskStatus.COMPLETED,
    Workload: 5,
    Difficulty: 1.0,
    CapacityLevel: '1200MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-01-20',
    CreatedDate: '2025-01-20',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250225-071',
    TaskName: '常规项目出差-常规项目出差',
    TaskClassID: 'TC009',
    Category: '常规项目出差',
    ProjectID: 'P007',
    AssigneeID: 'USER004',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 7,
    Difficulty: 1.2,
    CapacityLevel: '770MW',
    ReviewerID: 'USER006',
    ReviewerID2: 'USER007',
    StartDate: '2025-02-25',
    CreatedDate: '2025-02-25',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250310-072',
    TaskName: '核电项目出差-核电项目出差',
    TaskClassID: 'TC009',
    Category: '核电项目出差',
    ProjectID: 'P011',
    AssigneeID: 'USER005',
    Status: TaskStatus.NOT_STARTED,
    Workload: 6,
    Difficulty: 1.5,
    CapacityLevel: '1400MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-03-10',
    CreatedDate: '2025-03-10',
    CreatedBy: 'LEADER001'
  },

  // 其他任务 (TC010) - 对应P026-P030
  {
    TaskID: 'T-20250115-080',
    TaskName: '水电站员工技能培训项目-其他',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P026',
    AssigneeID: 'USER001',
    Status: TaskStatus.COMPLETED,
    Workload: 8,
    Difficulty: 1.0,
    CapacityLevel: '1000MW',
    ReviewerID: 'USER002',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-01-15',
    CreatedDate: '2025-01-15',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250201-081',
    TaskName: '水电行业标准制定项目-其他',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P027',
    AssigneeID: 'USER002',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 10,
    Difficulty: 1.3,
    CapacityLevel: '500MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    StartDate: '2025-02-01',
    CreatedDate: '2025-02-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250310-082',
    TaskName: '水电站安全评估项目-其他',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P028',
    AssigneeID: 'USER003',
    Status: TaskStatus.COMPLETED,
    Workload: 7,
    Difficulty: 1.2,
    CapacityLevel: '800MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER002',
    StartDate: '2025-03-10',
    CreatedDate: '2025-03-10',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20250401-083',
    TaskName: '水电技术国际交流项目-其他',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P029',
    AssigneeID: 'USER004',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 9,
    Difficulty: 1.4,
    CapacityLevel: '600MW',
    ReviewerID: 'USER006',
    ReviewerID2: 'LEADER001',
    StartDate: '2025-04-01',
    CreatedDate: '2025-04-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20250408-084',
    TaskName: '水电站环境影响评价项目-其他',
    TaskClassID: 'TC010',
    Category: '通用任务',
    ProjectID: 'P030',
    AssigneeID: 'USER005',
    Status: TaskStatus.NOT_STARTED,
    Workload: 6,
    Difficulty: 1.1,
    CapacityLevel: '400MW',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    StartDate: '2025-04-08',
    CreatedDate: '2025-04-08',
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
      const travelTasks = tasks.filter(t => t.TaskClassID === 'TC008'); // Travel tasks
      const labels = [...new Set(travelTasks.map(t => t.Category))];
      localStorage.setItem(STORAGE_KEYS.TRAVEL_LABELS, JSON.stringify(labels));
    }
  }

  // Helpers
  generateId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }
}

export const dataService = new DataService();
