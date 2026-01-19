/**
 * 测试数据生成脚本 (Node.js版本)
 * 用法: node generate-test-data.js
 */

const API_BASE = 'http://localhost:5001';

async function request(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function createUser(user) {
  return request('/api/users', 'POST', user);
}

async function createProject(project) {
  return request('/api/projects', 'POST', project);
}

async function createTask(task) {
  return request('/api/tasks', 'POST', task);
}

async function generateTestData() {
  console.log('=== 生成测试数据 ===\n');

  // 1. 创建管理员
  console.log('--- 创建管理员 ---');
  const adminResult = await createUser({
    userID: 'admin',
    name: '管理员',
    password: 'admin123',
    systemRole: 'ADMIN',
    officeLocation: 'Chengdu',
    status: 'Active',
    title: '系统管理员',
    education: '本科',
    school: '清华大学',
    remark: '系统管理员账号'
  });
  console.log('管理员创建结果:', adminResult);

  // 2. 创建班组长
  console.log('\n--- 创建班组长 ---');
  const leaders = [
    { userID: 'zhang', name: '张组长', officeLocation: 'Chengdu' },
    { userID: 'wang', name: '王组长', officeLocation: 'Deyang' },
    { userID: 'li', name: '李组长', officeLocation: 'Chengdu' },
  ];

  for (const leader of leaders) {
    const result = await createUser({
      userID: leader.userID,
      name: leader.name,
      password: '123456',
      systemRole: 'LEADER',
      officeLocation: leader.officeLocation,
      status: 'Active',
      title: '班组长',
      education: '硕士',
      remark: '班组长'
    });
    console.log(`创建用户 ${leader.userID}:`, result);
  }

  // 3. 创建组员
  console.log('\n--- 创建组员 ---');
  const members = [
    { userID: 'zhao', name: '赵工', location: 'Chengdu' },
    { userID: 'qian', name: '钱工', location: 'Chengdu' },
    { userID: 'sun', name: '孙工', location: 'Chengdu' },
    { userID: 'zhou', name: '周工', location: 'Chengdu' },
    { userID: 'wu', name: '吴工', location: 'Deyang' },
    { userID: 'zheng', name: '郑工', location: 'Deyang' },
    { userID: 'feng', name: '冯工', location: 'Deyang' },
    { userID: 'chen', name: '陈工', location: 'Chengdu' },
    { userID: 'chu', name: '楚工', location: 'Chengdu' },
    { userID: 'wei', name: '魏工', location: 'Chengdu' },
    { userID: 'jiang', name: '蒋工', location: 'Deyang' },
  ];

  for (const member of members) {
    const result = await createUser({
      userID: member.userID,
      name: member.name,
      password: '123456',
      systemRole: 'MEMBER',
      officeLocation: member.location,
      status: 'Active',
      title: '工程师',
      education: '本科'
    });
    console.log(`创建用户 ${member.userID}:`, result);
  }

  // 4. 创建项目
  console.log('\n--- 创建项目 ---');
  const projectCategories = [
    { category: 'MARKET', count: 8, prefix: 'MK' },
    { category: 'EXECUTION', count: 10, prefix: 'EX' },
    { category: 'NUCLEAR', count: 6, prefix: 'NU' },
    { category: 'PRODUCT_DEV', count: 6, prefix: 'PD' },
    { category: 'RESEARCH', count: 5, prefix: 'RS' },
    { category: 'RENOVATION', count: 5, prefix: 'RN' },
    { category: 'MEETING_TRAINING', count: 3, prefix: 'MT' },
    { category: 'ADMIN_PARTY', count: 2, prefix: 'AP' },
    { category: 'TRAVEL', count: 2, prefix: 'TR' },
    { category: 'OTHER', count: 3, prefix: 'OT' },
  ];

  const models = ['QFW-3000', 'QFW-2500', 'QFW-2000', 'QFW-1500', 'QFW-1000'];
  const capacities = ['3000MW', '2500MW', '2000MW', '1500MW', '1000MW'];

  for (const cat of projectCategories) {
    for (let i = 1; i <= cat.count; i++) {
      const randomUser = members[Math.floor(Math.random() * members.length)].userID;
      const result = await createProject({
        name: `${cat.category}项目${i}`,
        category: cat.category,
        workNo: `${cat.prefix}-2024-${String(i).padStart(3, '0')}`,
        startDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        model: models[Math.floor(Math.random() * models.length)],
        capacity: capacities[Math.floor(Math.random() * capacities.length)],
        isWon: Math.random() > 0.5,
        isForeign: Math.random() > 0.8,
        remark: '测试项目'
      });
      if (i === 1) console.log(`创建${cat.category}项目:`, result);
    }
  }

  // 5. 获取项目和用户列表用于创建任务
  console.log('\n获取项目和用户列表...');
  const usersResponse = await request('/api/users?pageSize=100');
  const users = usersResponse.data || [];
  const projectsResponse = await request('/api/projects?pageSize=100');
  const projects = projectsResponse.data || [];

  // 6. 创建任务
  console.log('\n--- 创建任务 ---');
  const taskClasses = ['TC001', 'TC002', 'TC003', 'TC004', 'TC005', 'TC006', 'TC007', 'TC008', 'TC009', 'TC010'];
  const taskCounts = [15, 20, 15, 15, 12, 12, 10, 8, 10, 18];
  const statuses = ['Pending', 'InProgress', 'Review', 'Completed'];
  const difficulties = ['Low', 'Medium', 'High', 'VeryHigh'];

  for (let ci = 0; ci < taskClasses.length; ci++) {
    const tc = taskClasses[ci];
    for (let i = 1; i <= taskCounts[ci]; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomProject = projects[Math.floor(Math.random() * projects.length)];
      const taskData = {
        taskName: `${tc}任务${i}`,
        taskClassID: tc,
        category: tc,
        assigneeID: randomUser?.userID || 'admin',
        startDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        workload: 1 + Math.floor(Math.random() * 10),
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        createdDate: new Date(Date.now() - Math.random() * 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkerWorkload: 1 + Math.floor(Math.random() * 5)
      };

      if (randomProject?.id) taskData.projectID = randomProject.id;
      if (tc === 'TC007') taskData.meetingDuration = 1 + Math.floor(Math.random() * 4);
      if (tc === 'TC009') {
        const locations = ['北京', '上海', '广州', '深圳', '杭州'];
        taskData.travelLocation = locations[Math.floor(Math.random() * locations.length)];
        taskData.travelDuration = 1 + Math.floor(Math.random() * 10);
        taskData.travelLabel = '出差支持';
      }

      const result = await createTask(taskData);
      if (i === 1 && ci === 0) console.log(`创建任务示例:`, result);
    }
  }

  console.log('\n=== 测试数据生成完成 ===');
  console.log('\n登录账号:');
  console.log('- 管理员: admin / admin123');
  console.log('- 其他用户: [用户名] / 123456');
}

generateTestData().catch(console.error);
