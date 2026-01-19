/**
 * 生成项目和任务数据（跳过已存在的用户）
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

async function createProject(project) {
  return request('/api/projects', 'POST', project);
}

async function createTask(task) {
  return request('/api/tasks', 'POST', task);
}

async function generateData() {
  console.log('=== 生成项目和任务数据 ===\n');

  // 获取用户列表
  console.log('获取用户列表...');
  const usersResponse = await request('/api/users?pageSize=100');
  const users = usersResponse.data || [];
  console.log(`找到 ${users.length} 个用户`);

  // 获取项目列表
  const projectsResponse = await request('/api/projects?pageSize=100');
  const existingProjects = projectsResponse.data || [];
  console.log(`已有 ${existingProjects.length} 个项目`);

  // 创建项目
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

  let projectCount = 0;
  for (const cat of projectCategories) {
    for (let i = 1; i <= cat.count; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
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
      projectCount++;
      if (i === 1) console.log(`创建${cat.category}项目:`, result.name || result);
    }
  }
  console.log(`\n创建了 ${projectCount} 个项目`);

  // 重新获取项目列表
  const newProjectsResponse = await request('/api/projects?pageSize=100');
  const projects = newProjectsResponse.data || [];
  console.log(`现在有 ${projects.length} 个项目`);

  // 创建任务
  console.log('\n--- 创建任务 ---');
  const taskClasses = ['TC001', 'TC002', 'TC003', 'TC004', 'TC005', 'TC006', 'TC007', 'TC008', 'TC009', 'TC010'];
  const taskCounts = [15, 20, 15, 15, 12, 12, 10, 8, 10, 18];
  const statuses = ['Pending', 'InProgress', 'Review', 'Completed'];
  const difficulties = ['Low', 'Medium', 'High', 'VeryHigh'];

  let taskCount = 0;
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

      await createTask(taskData);
      taskCount++;
    }
  }
  console.log(`创建了 ${taskCount} 个任务`);

  console.log('\n=== 数据生成完成 ===');
  console.log(`用户: ${users.length}`);
  console.log(`项目: ${projects.length}`);
  console.log(`任务: ${taskCount}`);
}

generateData().catch(console.error);
