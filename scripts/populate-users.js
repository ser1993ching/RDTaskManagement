/**
 * 人员数据初始化脚本
 * 1. 删除所有非admin用户
 * 2. 从人员清单创建用户
 */

const BASE_URL = 'http://localhost:5001';

// 人员清单数据
const personnelList = [
  { id: '1004889', name: '胡德剑', gender: '男', status: '在岗', role: '组员', title: '正高级主任工程师', location: '成都', joinDate: '1995-07-01' },
  { id: '1005184', name: '官永胜', gender: '男', status: '在岗', role: '组员', title: '主任工程师', location: '成都', joinDate: '1996-07-01' },
  { id: '1006279', name: '李朝科', gender: '男', status: '在岗', role: '组员', title: '主任工程师', location: '成都', joinDate: '1997-07-01' },
  { id: '1007204', name: '王建立', gender: '男', status: '在岗', role: '组员', title: '副主任工程师', location: '成都', joinDate: '1998-07-01' },
  { id: '1007241', name: '张玮', gender: '女', status: '在岗', role: '组员', title: '高级工程师', location: '德阳', joinDate: '1999-07-01' },
  { id: '1007465', name: '王黔', gender: '男', status: '在岗', role: '组员', title: '副主任工程师', location: '德阳', joinDate: '2000-07-01' },
  { id: '1007690', name: '金媛媛', gender: '女', status: '在岗', role: '组员', title: '副主任工程师', location: '成都', joinDate: '2001-07-01' },
  { id: '1008072', name: '卢永尧', gender: '男', status: '在岗', role: '组员', title: '副主任工程师', location: '成都', joinDate: '2002-07-01' },
  { id: '1008344', name: '陈增芬', gender: '女', status: '在岗', role: '组员', title: '高级工程师', location: '成都', joinDate: '2003-07-01' },
  { id: '1008513', name: '孙青', gender: '女', status: '在岗', role: '组员', title: '高级工程师', location: '德阳', joinDate: '2004-07-01' },
  { id: '3001226', name: '李又超', gender: '男', status: '在岗', role: '班组长', title: '副主任工程师', location: '成都', joinDate: '2005-07-01' },
  { id: '3002681', name: '杨迪', gender: '男', status: '在岗', role: '组员', title: '高级工程师', location: '德阳', joinDate: '2006-07-01' },
  { id: '3002684', name: '古曦', gender: '男', status: '在岗', role: '班组长', title: '高级工程师', location: '德阳', joinDate: '2007-07-01' },
  { id: '3002865', name: '钟德富', gender: '男', status: '在岗', role: '班组长', title: '高级工程师', location: '德阳', joinDate: '2008-07-01' },
  { id: '3003407', name: '廖亨友', gender: '男', status: '在岗', role: '组员', title: '高级工程师', location: '成都', joinDate: '2009-07-01' },
  { id: '3004412', name: '蒋群雄', gender: '男', status: '在岗', role: '组员', title: '高级工程师', location: '德阳', joinDate: '2010-07-01' },
  { id: '3005901', name: '王雅雯', gender: '女', status: '在岗', role: '组员', title: '工程师', location: '成都', joinDate: '2011-07-01' },
  { id: '3005905', name: '曹驰健', gender: '男', status: '在岗', role: '组员', title: '工程师', location: '德阳', joinDate: '2012-07-01' },
  { id: '3005922', name: '王鸿', gender: '男', status: '在岗', role: '班组长', title: '工程师', location: '成都', joinDate: '2013-07-01' },
  { id: '3005925', name: '杨巍', gender: '男', status: '在岗', role: '班组长', title: '工程师', location: '成都', joinDate: '2014-07-01' },
  { id: '3006612', name: '黄鑫', gender: '女', status: '在岗', role: '组员', title: '工程师', location: '德阳', joinDate: '2015-07-01' },
  { id: '3007213', name: '王可欣', gender: '女', status: '在岗', role: '组员', title: '工程师', location: '德阳', joinDate: '2016-07-01' },
  { id: '3007227', name: '苏文博', gender: '男', status: '在岗', role: '组员', title: '工程师', location: '成都', joinDate: '2017-07-01' },
  { id: '3008172', name: '樊嘉豪', gender: '男', status: '在岗', role: '组员', title: '工程师', location: '成都', joinDate: '2018-07-01' },
  { id: '3008231', name: '李典', gender: '女', status: '在岗', role: '组员', title: '工程师', location: '成都', joinDate: '2019-07-01' },
  { id: '3009101', name: '刘林涵', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2020-07-01' },
  { id: '3010363', name: '刘咏芳', gender: '女', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2021-07-01' },
  { id: '3010758', name: '魏宇航', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2022-07-01' },
  { id: '3010862', name: '贺向东', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2022-07-01' },
  { id: '3012527', name: '杨飞越', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2022-07-01' },
  { id: '3012524', name: '徐青青', gender: '女', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2022-07-01' },
  { id: '3012478', name: '牟星宇', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2022-07-01' },
  { id: '3012451', name: '郑典涛', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2023-07-01' },
  { id: '3012535', name: '盛晋银', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2023-07-01' },
  { id: '3014242', name: '罗欢', gender: '女', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2023-07-01' },
  { id: '3014388', name: '郑淇文', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2023-07-01' },
  { id: '3014531', name: '杨攀', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2023-07-01' },
  { id: '3014253', name: '黄泽奇', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2023-07-01' },
  { id: '3014229', name: '曾一涛', gender: '男', status: '在岗', role: '组员', title: '助理工程师', location: '成都', joinDate: '2023-07-01' },
];

const DEFAULT_PASSWORD = '123';

async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

async function login() {
  console.log('正在登录...');
  const result = await fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userId: 'admin', password: 'admin' }),
  });

  console.log('登录成功！');
  return result.token;
}

async function deleteAllNonAdminUsers(token) {
  console.log('获取用户列表...');
  const response = await fetchApi('/api/users?pageSize=1000', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const users = response.data || [];

  console.log(`找到 ${users.length} 个用户`);

  let deletedCount = 0;
  for (const user of users) {
    if (user.userID !== 'admin') {
      console.log(`删除用户: ${user.userID} - ${user.name}`);
      await fetchApi(`/api/users/${user.userID}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      deletedCount++;
    }
  }

  console.log(`已删除 ${deletedCount} 个用户`);
}

async function createUser(token, userData) {
  const userPayload = {
    userID: userData.id,
    name: userData.name,
    gender: userData.gender,
    systemRole: userData.role,
    officeLocation: userData.location,
    title: userData.title,
    joinDate: userData.joinDate,
    status: userData.status,
    password: DEFAULT_PASSWORD,
  };

  await fetchApi('/api/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(userPayload),
  });
}

async function createAllUsers(token) {
  console.log(`\n开始创建 ${personnelList.length} 个用户...`);

  let successCount = 0;
  for (const person of personnelList) {
    try {
      await createUser(token, person);
      console.log(`✓ 创建成功: ${person.id} - ${person.name}`);
      successCount++;
    } catch (error) {
      console.error(`✗ 创建失败: ${person.id} - ${person.name}: ${error.message}`);
    }
  }

  console.log(`\n成功创建 ${successCount}/${personnelList.length} 个用户`);
}

async function verifyUsers(token) {
  console.log('\n验证用户列表...');
  const response = await fetchApi('/api/users?pageSize=1000', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const users = response.data || [];

  console.log(`当前共有 ${users.length} 个用户`);
  users.forEach(u => {
    console.log(`  ${u.userID} - ${u.name} (${u.gender})`);
  });
}

async function main() {
  try {
    const token = await login();
    await deleteAllNonAdminUsers(token);
    await createAllUsers(token);
    await verifyUsers(token);
    console.log('\n=== 初始化完成 ===');
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

main();
