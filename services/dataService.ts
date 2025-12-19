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
  'PRODUCT_DEV': ['技术方案', '设计流程', '方案评审', '专利申请', '出图', '图纸改版', '设计总结'],
  'RESEARCH': ['开题报告', '专利申请', '结题报告', '其他'],
  'RENOVATION': ['前期项目配合', '方案编制', '其他'],
  'MEETING_TRAINING': ['学习与培训', '党建会议', '班务会', '设计评审会', '资料讨论会', '其他'],
  'ADMIN_PARTY': ['报表填报', 'ppt汇报', '总结报告', '其他'],
  'TRAVEL': ['市场配合出差', '项目执行出差', '产品研发出差', '科研出差', '生产服务出差', '其他'],
  'OTHER': ['通用任务']
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
  {
    id: 'P001',
    name: 'HBR-1000MW高效机组',
    category: ProjectCategory.EXECUTION,
    workNo: 'WORK-2023-001',
    capacity: '1000MW',
    startDate: '2023-01-10',
    model: 'Francis'
  },
  {
    id: 'P002',
    name: '某海外抽水蓄能投标',
    category: ProjectCategory.MARKET,
    isWon: false,
    isForeign: true,
    startDate: '2023-08-01'
  },
  {
    id: 'P003',
    name: '新型水轮机叶片研发',
    category: ProjectCategory.RESEARCH,
    workNo: 'RESEARCH-2023-002',
    capacity: '800MW',
    startDate: '2023-03-01',
    model: 'Kaplan'
  },
  {
    id: 'P004',
    name: '三峡机组改造项目',
    category: ProjectCategory.RENOVATION,
    workNo: 'RENO-2023-003',
    capacity: '700MW',
    startDate: '2023-05-15',
    model: 'Francis'
  },
  {
    id: 'P005',
    name: '国内某大型水电站投标',
    category: ProjectCategory.MARKET,
    isWon: true,
    isForeign: false,
    startDate: '2023-06-01'
  },
  {
    id: 'P006',
    name: '抽水蓄能机组优化设计',
    category: ProjectCategory.EXECUTION,
    workNo: 'WORK-2023-004',
    capacity: '300MW',
    startDate: '2023-07-20',
    model: 'Francis'
  },
  {
    id: 'P007',
    name: '智能化监控系统研发',
    category: ProjectCategory.RESEARCH,
    workNo: 'RESEARCH-2023-005',
    startDate: '2023-09-01'
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
    name: '项目执行',
    code: 'EXECUTION',
    description: '项目执行相关任务'
  },
  {
    id: 'TC003',
    name: '产品研发',
    code: 'PRODUCT_DEV',
    description: '产品研发相关任务'
  },
  {
    id: 'TC004',
    name: '科研任务',
    code: 'RESEARCH',
    description: '科研任务相关工作'
  },
  {
    id: 'TC005',
    name: '改造服务',
    code: 'RENOVATION',
    description: '改造服务相关任务'
  },
  {
    id: 'TC006',
    name: '内部会议与培训',
    code: 'MEETING_TRAINING',
    description: '内部会议与培训相关工作'
  },
  {
    id: 'TC007',
    name: '行政与党建',
    code: 'ADMIN_PARTY',
    description: '行政与党建相关工作'
  },
  {
    id: 'TC008',
    name: '差旅任务',
    code: 'TRAVEL',
    description: '差旅相关任务'
  },
  {
    id: 'TC009',
    name: '其他任务',
    code: 'OTHER',
    description: '其他类型任务'
  }
];

const seedTasks: Task[] = [
  // 市场配合任务 (TC001)
  {
    TaskID: 'T-20231001-001',
    TaskName: 'HBR-1000MW高效机组-图纸会签',
    TaskClassID: 'TC002',
    Category: '图纸会签',
    ProjectID: 'P001',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 5,
    Difficulty: 1.2,
    CreatedDate: '2023-10-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20231101-001',
    TaskName: '海外抽水蓄能投标-技术方案',
    TaskClassID: 'TC001',
    Category: '技术方案',
    ProjectID: 'P002',
    AssigneeID: 'LEADER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 8,
    Difficulty: 1.5,
    CapacityLevel: '1000MW等级',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    CreatedDate: '2023-11-01',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20231102-001',
    TaskName: '国内大型水电站投标-标书制作',
    TaskClassID: 'TC001',
    Category: '标书',
    ProjectID: 'P005',
    AssigneeID: 'LEADER001',
    Status: TaskStatus.COMPLETED,
    Workload: 12,
    Difficulty: 1.8,
    CapacityLevel: '600MW等级',
    ReviewerID: 'USER002',
    ReviewerID2: 'USER003',
    CreatedDate: '2023-11-02',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20231103-001',
    TaskName: '海外项目复询-技术澄清',
    TaskClassID: 'TC001',
    Category: '复询',
    ProjectID: 'P002',
    AssigneeID: 'USER002',
    Status: TaskStatus.NOT_STARTED,
    Workload: 3,
    Difficulty: 1.0,
    CapacityLevel: '1000MW等级',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    CreatedDate: '2023-11-03',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20231104-001',
    TaskName: '市场调研-竞品分析',
    TaskClassID: 'TC001',
    Category: '其他',
    ProjectID: undefined,
    AssigneeID: 'USER004',
    Status: TaskStatus.COMPLETED,
    Workload: 4,
    Difficulty: 0.8,
    CapacityLevel: '300MW等级',
    ReviewerID: 'USER006',
    ReviewerID2: 'LEADER001',
    CreatedDate: '2023-11-04',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20231105-001',
    TaskName: '新客户拜访-技术交流',
    TaskClassID: 'TC001',
    Category: '其他',
    ProjectID: undefined,
    AssigneeID: 'USER006',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 2,
    Difficulty: 0.5,
    CapacityLevel: 'F级燃机',
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    CreatedDate: '2023-11-05',
    CreatedBy: 'LEADER001'
  },

  // 项目执行任务 (TC002)
  {
    TaskID: 'T-20231002-001',
    TaskName: 'HBR-1000MW高效机组-设计院提资',
    TaskClassID: 'TC002',
    Category: '设计院提资',
    ProjectID: 'P001',
    AssigneeID: 'USER002',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 6,
    Difficulty: 1.3,
    CreatedDate: '2023-10-02',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20231003-001',
    TaskName: 'HBR-1000MW高效机组-CT配合与提资',
    TaskClassID: 'TC002',
    Category: 'CT配合与提资',
    ProjectID: 'P001',
    AssigneeID: 'USER003',
    Status: TaskStatus.NOT_STARTED,
    Workload: 4,
    Difficulty: 1.0,
    CreatedDate: '2023-10-03',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20231004-001',
    TaskName: 'HBR-1000MW高效机组-随机资料',
    TaskClassID: 'TC002',
    Category: '随机资料',
    ProjectID: 'P001',
    AssigneeID: 'USER001',
    Status: TaskStatus.COMPLETED,
    Workload: 3,
    Difficulty: 0.8,
    CreatedDate: '2023-10-04',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20231005-001',
    TaskName: '抽水蓄能机组优化设计-项目特殊项处理',
    TaskClassID: 'TC002',
    Category: '项目特殊项处理',
    ProjectID: 'P006',
    AssigneeID: 'USER005',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 7,
    Difficulty: 1.6,
    CreatedDate: '2023-10-05',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20231006-001',
    TaskName: 'HBR-1000MW高效机组-用户配合',
    TaskClassID: 'TC002',
    Category: '用户配合',
    ProjectID: 'P001',
    AssigneeID: 'USER006',
    Status: TaskStatus.NOT_STARTED,
    Workload: 2,
    Difficulty: 0.5,
    CreatedDate: '2023-10-06',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20231007-001',
    TaskName: '抽水蓄能机组优化设计-图纸会签',
    TaskClassID: 'TC002',
    Category: '图纸会签',
    ProjectID: 'P006',
    AssigneeID: 'USER003',
    Status: TaskStatus.NOT_STARTED,
    Workload: 5,
    Difficulty: 1.2,
    CreatedDate: '2023-10-07',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20231008-001',
    TaskName: '抽水蓄能机组优化设计-传真回复',
    TaskClassID: 'TC002',
    Category: '传真回复',
    ProjectID: 'P006',
    AssigneeID: 'USER001',
    Status: TaskStatus.COMPLETED,
    Workload: 1,
    Difficulty: 0.3,
    CreatedDate: '2023-10-08',
    CreatedBy: 'LEADER001'
  },

  // 产品研发任务 (TC003)
  {
    TaskID: 'T-20231201-001',
    TaskName: '新型水轮机叶片研发-技术方案',
    TaskClassID: 'TC003',
    Category: '技术方案',
    ProjectID: 'P003',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 10,
    Difficulty: 2.0,
    CreatedDate: '2023-12-01',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20231202-001',
    TaskName: '智能化监控系统研发-设计流程',
    TaskClassID: 'TC003',
    Category: '设计流程',
    ProjectID: 'P007',
    AssigneeID: 'USER007',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 8,
    Difficulty: 1.8,
    CreatedDate: '2023-12-02',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20231203-001',
    TaskName: '新型水轮机叶片研发-方案评审',
    TaskClassID: 'TC003',
    Category: '方案评审',
    ProjectID: 'P003',
    AssigneeID: 'LEADER001',
    Status: TaskStatus.NOT_STARTED,
    Workload: 3,
    Difficulty: 1.0,
    CreatedDate: '2023-12-03',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20231204-001',
    TaskName: '智能化监控系统研发-专利申请',
    TaskClassID: 'TC003',
    Category: '专利申请',
    ProjectID: 'P007',
    AssigneeID: 'USER006',
    Status: TaskStatus.NOT_STARTED,
    Workload: 4,
    Difficulty: 1.2,
    CreatedDate: '2023-12-04',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20231205-001',
    TaskName: '新型水轮机叶片研发-出图',
    TaskClassID: 'TC003',
    Category: '出图',
    ProjectID: 'P003',
    AssigneeID: 'USER002',
    Status: TaskStatus.NOT_STARTED,
    Workload: 6,
    Difficulty: 1.5,
    CreatedDate: '2023-12-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20231206-001',
    TaskName: '智能化监控系统研发-图纸改版',
    TaskClassID: 'TC003',
    Category: '图纸改版',
    ProjectID: 'P007',
    AssigneeID: 'USER002',
    Status: TaskStatus.NOT_STARTED,
    Workload: 3,
    Difficulty: 1.0,
    CreatedDate: '2023-12-06',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20231207-001',
    TaskName: '新型水轮机叶片研发-设计总结',
    TaskClassID: 'TC003',
    Category: '设计总结',
    ProjectID: 'P003',
    AssigneeID: 'USER003',
    Status: TaskStatus.NOT_STARTED,
    Workload: 2,
    Difficulty: 0.8,
    CreatedDate: '2023-12-07',
    CreatedBy: 'admin'
  },

  // 科研任务 (TC004)
  {
    TaskID: 'T-20240101-001',
    TaskName: '水轮机效率优化研究-开题报告',
    TaskClassID: 'TC004',
    Category: '开题报告',
    ProjectID: 'P003',
    AssigneeID: 'USER007',
    Status: TaskStatus.COMPLETED,
    Workload: 3,
    Difficulty: 1.0,
    CreatedDate: '2024-01-01',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240102-001',
    TaskName: '水轮机效率优化研究-专利申请',
    TaskClassID: 'TC004',
    Category: '专利申请',
    ProjectID: 'P003',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 5,
    Difficulty: 1.5,
    CreatedDate: '2024-01-02',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240103-001',
    TaskName: '水轮机效率优化研究-结题报告',
    TaskClassID: 'TC004',
    Category: '结题报告',
    ProjectID: 'P003',
    AssigneeID: 'USER003',
    Status: TaskStatus.NOT_STARTED,
    Workload: 4,
    Difficulty: 1.2,
    CreatedDate: '2024-01-03',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240104-001',
    TaskName: '智能化监控系统研究-其他',
    TaskClassID: 'TC004',
    Category: '其他',
    ProjectID: 'P007',
    AssigneeID: 'USER007',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 6,
    Difficulty: 1.8,
    CreatedDate: '2024-01-04',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240105-001',
    TaskName: '新材料应用研究-开题报告',
    TaskClassID: 'TC004',
    Category: '开题报告',
    ProjectID: undefined,
    AssigneeID: 'USER004',
    Status: TaskStatus.NOT_STARTED,
    Workload: 3,
    Difficulty: 1.0,
    CreatedDate: '2024-01-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240106-001',
    TaskName: '新材料应用研究-结题报告',
    TaskClassID: 'TC004',
    Category: '结题报告',
    ProjectID: undefined,
    AssigneeID: 'USER004',
    Status: TaskStatus.NOT_STARTED,
    Workload: 4,
    Difficulty: 1.2,
    CreatedDate: '2024-01-06',
    CreatedBy: 'LEADER001'
  },

  // 改造服务任务 (TC005)
  {
    TaskID: 'T-20240201-001',
    TaskName: '三峡机组改造-前期项目配合',
    TaskClassID: 'TC005',
    Category: '前期项目配合',
    ProjectID: 'P004',
    AssigneeID: 'LEADER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 5,
    Difficulty: 1.3,
    CreatedDate: '2024-02-01',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240202-001',
    TaskName: '三峡机组改造-方案编制',
    TaskClassID: 'TC005',
    Category: '方案编制',
    ProjectID: 'P004',
    AssigneeID: 'USER005',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 8,
    Difficulty: 1.8,
    CreatedDate: '2024-02-02',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240203-001',
    TaskName: '三峡机组改造-其他',
    TaskClassID: 'TC005',
    Category: '其他',
    ProjectID: 'P004',
    AssigneeID: 'USER006',
    Status: TaskStatus.NOT_STARTED,
    Workload: 2,
    Difficulty: 0.8,
    CreatedDate: '2024-02-03',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240204-001',
    TaskName: '老旧机组改造调研-前期项目配合',
    TaskClassID: 'TC005',
    Category: '前期项目配合',
    ProjectID: undefined,
    AssigneeID: 'USER004',
    Status: TaskStatus.COMPLETED,
    Workload: 3,
    Difficulty: 1.0,
    CreatedDate: '2024-02-04',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240205-001',
    TaskName: '老旧机组改造调研-方案编制',
    TaskClassID: 'TC005',
    Category: '方案编制',
    ProjectID: undefined,
    AssigneeID: 'USER005',
    Status: TaskStatus.NOT_STARTED,
    Workload: 4,
    Difficulty: 1.2,
    CreatedDate: '2024-02-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240206-001',
    TaskName: '老旧机组改造调研-其他',
    TaskClassID: 'TC005',
    Category: '其他',
    ProjectID: undefined,
    AssigneeID: 'USER006',
    Status: TaskStatus.NOT_STARTED,
    Workload: 2,
    Difficulty: 0.8,
    CreatedDate: '2024-02-06',
    CreatedBy: 'LEADER001'
  },

  // 内部会议与培训任务 (TC006)
  {
    TaskID: 'T-20240301-001',
    TaskName: '水轮机技术培训-学习与培训',
    TaskClassID: 'TC006',
    Category: '学习与培训',
    ProjectID: undefined,
    AssigneeID: 'USER001',
    Status: TaskStatus.COMPLETED,
    Workload: 8,
    Difficulty: 1.0,
    CreatedDate: '2024-03-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240302-001',
    TaskName: '党支部学习会-党建会议',
    TaskClassID: 'TC006',
    Category: '党建会议',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.COMPLETED,
    Workload: 2,
    Difficulty: 0.5,
    CreatedDate: '2024-03-02',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240303-001',
    TaskName: '周例会-班务会',
    TaskClassID: 'TC006',
    Category: '班务会',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 1,
    Difficulty: 0.3,
    CreatedDate: '2024-03-03',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240304-001',
    TaskName: 'HBR项目评审会-设计评审会',
    TaskClassID: 'TC006',
    Category: '设计评审会',
    ProjectID: 'P001',
    AssigneeID: 'LEADER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 3,
    Difficulty: 0.8,
    CreatedDate: '2024-03-04',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240305-001',
    TaskName: '技术方案讨论会-资料讨论会',
    TaskClassID: 'TC006',
    Category: '资料讨论会',
    ProjectID: 'P003',
    AssigneeID: 'USER001',
    Status: TaskStatus.NOT_STARTED,
    Workload: 2,
    Difficulty: 0.5,
    CreatedDate: '2024-03-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240306-001',
    TaskName: '月度总结会-其他',
    TaskClassID: 'TC006',
    Category: '其他',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.NOT_STARTED,
    Workload: 1,
    Difficulty: 0.3,
    CreatedDate: '2024-03-06',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240307-001',
    TaskName: '新员工入职培训-学习与培训',
    TaskClassID: 'TC006',
    Category: '学习与培训',
    ProjectID: undefined,
    AssigneeID: 'USER003',
    Status: TaskStatus.NOT_STARTED,
    Workload: 4,
    Difficulty: 0.8,
    CreatedDate: '2024-03-07',
    CreatedBy: 'LEADER001'
  },

  // 行政与党建任务 (TC007)
  {
    TaskID: 'T-20240401-001',
    TaskName: '月度工作报表-报表填报',
    TaskClassID: 'TC007',
    Category: '报表填报',
    ProjectID: undefined,
    AssigneeID: 'USER006',
    Status: TaskStatus.COMPLETED,
    Workload: 2,
    Difficulty: 0.5,
    CreatedDate: '2024-04-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240402-001',
    TaskName: '年度总结汇报-ppt汇报',
    TaskClassID: 'TC007',
    Category: 'ppt汇报',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.COMPLETED,
    Workload: 6,
    Difficulty: 1.2,
    CreatedDate: '2024-04-02',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240403-001',
    TaskName: '项目总结报告-总结报告',
    TaskClassID: 'TC007',
    Category: '总结报告',
    ProjectID: 'P001',
    AssigneeID: 'USER001',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 5,
    Difficulty: 1.0,
    CreatedDate: '2024-04-03',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240404-001',
    TaskName: '党费缴纳-其他',
    TaskClassID: 'TC007',
    Category: '其他',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.COMPLETED,
    Workload: 0.5,
    Difficulty: 0.2,
    CreatedDate: '2024-04-04',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240405-001',
    TaskName: '季度安全检查-报表填报',
    TaskClassID: 'TC007',
    Category: '报表填报',
    ProjectID: undefined,
    AssigneeID: 'USER006',
    Status: TaskStatus.NOT_STARTED,
    Workload: 3,
    Difficulty: 0.8,
    CreatedDate: '2024-04-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240406-001',
    TaskName: '技术分享会-ppt汇报',
    TaskClassID: 'TC007',
    Category: 'ppt汇报',
    ProjectID: undefined,
    AssigneeID: 'USER002',
    Status: TaskStatus.NOT_STARTED,
    Workload: 4,
    Difficulty: 1.0,
    CreatedDate: '2024-04-06',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240407-001',
    TaskName: '部门年度总结-总结报告',
    TaskClassID: 'TC007',
    Category: '总结报告',
    ProjectID: undefined,
    AssigneeID: 'LEADER001',
    Status: TaskStatus.NOT_STARTED,
    Workload: 8,
    Difficulty: 1.5,
    CreatedDate: '2024-04-07',
    CreatedBy: 'admin'
  },

  // 差旅任务 (TC008)
  {
    TaskID: 'T-20240501-001',
    TaskName: '客户现场技术支持-市场配合',
    TaskClassID: 'TC008',
    Category: '市场配合出差',
    ProjectID: 'P005',
    AssigneeID: 'USER001',
    Status: TaskStatus.COMPLETED,
    Workload: 3,
    Difficulty: 0.8,
    TravelLocation: '北京',
    TravelDuration: 3,
    ReviewerID: 'USER002',
    ReviewerID2: 'LEADER001',
    CreatedDate: '2024-05-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240502-001',
    TaskName: '项目执行现场配合-项目执行',
    TaskClassID: 'TC008',
    Category: '项目执行出差',
    ProjectID: 'P001',
    AssigneeID: 'USER003',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 5,
    Difficulty: 1.2,
    TravelLocation: '三峡工地',
    TravelDuration: 5,
    ReviewerID: 'USER001',
    ReviewerID2: 'USER007',
    CreatedDate: '2024-05-02',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240503-001',
    TaskName: '新产品研发测试-产品研发',
    TaskClassID: 'TC008',
    Category: '产品研发出差',
    ProjectID: 'P003',
    AssigneeID: 'USER007',
    Status: TaskStatus.NOT_STARTED,
    Workload: 7,
    Difficulty: 1.5,
    TravelLocation: '上海',
    TravelDuration: 7,
    ReviewerID: 'USER003',
    ReviewerID2: 'USER002',
    CreatedDate: '2024-05-03',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240504-001',
    TaskName: '学术会议参会-科研',
    TaskClassID: 'TC008',
    Category: '科研出差',
    ProjectID: undefined,
    AssigneeID: 'USER001',
    Status: TaskStatus.NOT_STARTED,
    Workload: 2,
    Difficulty: 0.5,
    TravelLocation: '西安',
    TravelDuration: 2,
    ReviewerID: 'USER006',
    ReviewerID2: 'LEADER001',
    CreatedDate: '2024-05-04',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240505-001',
    TaskName: '设备验收-生产服务',
    TaskClassID: 'TC008',
    Category: '生产服务出差',
    ProjectID: 'P006',
    AssigneeID: 'USER006',
    Status: TaskStatus.NOT_STARTED,
    Workload: 4,
    Difficulty: 1.0,
    TravelLocation: '哈尔滨',
    TravelDuration: 4,
    ReviewerID: 'USER004',
    ReviewerID2: 'USER005',
    CreatedDate: '2024-05-05',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240506-001',
    TaskName: '供应商考察-其他',
    TaskClassID: 'TC008',
    Category: '其他',
    ProjectID: undefined,
    AssigneeID: 'USER004',
    Status: TaskStatus.NOT_STARTED,
    Workload: 2,
    Difficulty: 0.5,
    TravelLocation: '广州',
    TravelDuration: 2,
    ReviewerID: 'USER006',
    ReviewerID2: 'USER005',
    CreatedDate: '2024-05-06',
    CreatedBy: 'LEADER001'
  },

  // 其他任务 (TC009)
  {
    TaskID: 'T-20240601-001',
    TaskName: '通用技术调研',
    TaskClassID: 'TC009',
    Category: '通用任务',
    ProjectID: undefined,
    AssigneeID: 'USER004',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 3,
    Difficulty: 1.0,
    CreatedDate: '2024-06-01',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240602-001',
    TaskName: '设备维护保养',
    TaskClassID: 'TC009',
    Category: '通用任务',
    ProjectID: undefined,
    AssigneeID: 'USER006',
    Status: TaskStatus.COMPLETED,
    Workload: 2,
    Difficulty: 0.8,
    CreatedDate: '2024-06-02',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240603-001',
    TaskName: '文档整理归档',
    TaskClassID: 'TC009',
    Category: '通用任务',
    ProjectID: undefined,
    AssigneeID: 'USER006',
    Status: TaskStatus.IN_PROGRESS,
    Workload: 4,
    Difficulty: 0.5,
    CreatedDate: '2024-06-03',
    CreatedBy: 'admin'
  },
  {
    TaskID: 'T-20240604-001',
    TaskName: '技术支持热线',
    TaskClassID: 'TC009',
    Category: '通用任务',
    ProjectID: undefined,
    AssigneeID: 'USER001',
    Status: TaskStatus.NOT_STARTED,
    Workload: 1,
    Difficulty: 0.3,
    CreatedDate: '2024-06-04',
    CreatedBy: 'LEADER001'
  },
  {
    TaskID: 'T-20240605-001',
    TaskName: '备件库存盘点',
    TaskClassID: 'TC009',
    Category: '通用任务',
    ProjectID: undefined,
    AssigneeID: 'USER004',
    Status: TaskStatus.NOT_STARTED,
    Workload: 3,
    Difficulty: 0.8,
    CreatedDate: '2024-06-05',
    CreatedBy: 'LEADER001'
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
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
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
    // Initialize Equipment Models from existing projects
    if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT_MODELS)) {
      const projects = this.getProjects();
      const models = [...new Set(projects.filter(p => p.model).map(p => p.model!))];
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT_MODELS, JSON.stringify(models));
    }

    // Initialize Capacity Levels from existing tasks
    if (!localStorage.getItem(STORAGE_KEYS.CAPACITY_LEVELS)) {
      const tasks = this.getTasks();
      const levels = [...new Set(tasks.filter(t => t.CapacityLevel).map(t => t.CapacityLevel!))];
      localStorage.setItem(STORAGE_KEYS.CAPACITY_LEVELS, JSON.stringify(levels));
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
