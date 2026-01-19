/**
 * 修复编码问题，重新创建用户
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

// 人员清单数据
const staffList = [
  { userID: '1004889', name: '胡德剑', gender: '男', status: 'Active', role: 'MEMBER', title: '正高级主任工程师', officeLocation: '成都', joinDate: '1995-07-01' },
  { userID: '1005184', name: '官永胜', gender: '男', status: 'Active', role: 'MEMBER', title: '主任工程师', officeLocation: '成都', joinDate: '1996-07-01' },
  { userID: '1006279', name: '李朝科', gender: '男', status: 'Active', role: 'MEMBER', title: '主任工程师', officeLocation: '成都', joinDate: '1997-07-01' },
  { userID: '1007204', name: '王建立', gender: '男', status: 'Active', role: 'MEMBER', title: '副主任工程师', officeLocation: '成都', joinDate: '1998-07-01' },
  { userID: '1007241', name: '张玮', gender: '女', status: 'Active', role: 'MEMBER', title: '高级工程师', officeLocation: '德阳', joinDate: '1999-07-01' },
  { userID: '1007465', name: '王黔', gender: '男', status: 'Active', role: 'MEMBER', title: '副主任工程师', officeLocation: '德阳', joinDate: '2000-07-01' },
  { userID: '1007690', name: '金媛媛', gender: '女', status: 'Active', role: 'MEMBER', title: '副主任工程师', officeLocation: '成都', joinDate: '2001-07-01' },
  { userID: '1008072', name: '卢永尧', gender: '男', status: 'Active', role: 'MEMBER', title: '副主任工程师', officeLocation: '成都', joinDate: '2002-07-01' },
  { userID: '1008344', name: '陈增芬', gender: '女', status: 'Active', role: 'MEMBER', title: '高级工程师', officeLocation: '成都', joinDate: '2003-07-01' },
  { userID: '1008513', name: '孙青', gender: '女', status: 'Active', role: 'MEMBER', title: '高级工程师', officeLocation: '德阳', joinDate: '2004-07-01' },
  { userID: '3001226', name: '李又超', gender: '男', status: 'Active', role: 'LEADER', title: '副主任工程师', officeLocation: '成都', joinDate: '2005-07-01' },
  { userID: '3002681', name: '杨迪', gender: '男', status: 'Active', role: 'MEMBER', title: '高级工程师', officeLocation: '德阳', joinDate: '2006-07-01' },
  { userID: '3002684', name: '古曦', gender: '男', status: 'Active', role: 'LEADER', title: '高级工程师', officeLocation: '德阳', joinDate: '2007-07-01' },
  { userID: '3002865', name: '钟德富', gender: '男', status: 'Active', role: 'LEADER', title: '高级工程师', officeLocation: '德阳', joinDate: '2008-07-01' },
  { userID: '3003407', name: '廖亨友', gender: '男', status: 'Active', role: 'MEMBER', title: '高级工程师', officeLocation: '成都', joinDate: '2009-07-01' },
  { userID: '3004412', name: '蒋群雄', gender: '男', status: 'Active', role: 'MEMBER', title: '高级工程师', officeLocation: '德阳', joinDate: '2010-07-01' },
  { userID: '3005901', name: '王雅雯', gender: '女', status: 'Active', role: 'MEMBER', title: '工程师', officeLocation: '成都', joinDate: '2011-07-01' },
  { userID: '3005905', name: '曹驰健', gender: '男', status: 'Active', role: 'MEMBER', title: '工程师', officeLocation: '德阳', joinDate: '2012-07-01' },
  { userID: '3005922', name: '王鸿', gender: '男', status: 'Active', role: 'LEADER', title: '工程师', officeLocation: '成都', joinDate: '2013-07-01' },
  { userID: '3005925', name: '杨巍', gender: '男', status: 'Active', role: 'LEADER', title: '工程师', officeLocation: '成都', joinDate: '2014-07-01' },
  { userID: '3006612', name: '黄鑫', gender: '女', status: 'Active', role: 'MEMBER', title: '工程师', officeLocation: '德阳', joinDate: '2015-07-01' },
  { userID: '3007213', name: '王可欣', gender: '女', status: 'Active', role: 'MEMBER', title: '工程师', officeLocation: '德阳', joinDate: '2016-07-01' },
  { userID: '3007227', name: '苏文博', gender: '男', status: 'Active', role: 'MEMBER', title: '工程师', officeLocation: '成都', joinDate: '2017-07-01' },
  { userID: '3008172', name: '樊嘉豪', gender: '男', status: 'Active', role: 'MEMBER', title: '工程师', officeLocation: '成都', joinDate: '2018-07-01' },
  { userID: '3008231', name: '李典', gender: '女', status: 'Active', role: 'MEMBER', title: '工程师', officeLocation: '成都', joinDate: '2019-07-01' },
  { userID: '3009101', name: '刘林涵', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2020-07-01' },
  { userID: '3010363', name: '刘咏芳', gender: '女', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2021-07-01' },
  { userID: '3010758', name: '魏宇航', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2022-07-01' },
  { userID: '3010862', name: '贺向东', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2022-07-01' },
  { userID: '3012527', name: '杨飞越', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2022-07-01' },
  { userID: '3012524', name: '徐青青', gender: '女', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2022-07-01' },
  { userID: '3012478', name: '牟星宇', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2022-07-01' },
  { userID: '3012451', name: '郑典涛', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2023-07-01' },
  { userID: '3012535', name: '盛晋银', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2023-07-01' },
  { userID: '3014242', name: '罗欢', gender: '女', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2023-07-01' },
  { userID: '3014388', name: '郑淇文', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2023-07-01' },
  { userID: '3014531', name: '杨攀', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2023-07-01' },
  { userID: '3014253', name: '黄泽奇', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2023-07-01' },
  { userID: '3014229', name: '曾一涛', gender: '男', status: 'Active', role: 'MEMBER', title: '助理工程师', officeLocation: '成都', joinDate: '2023-07-01' },
];

const PASSWORD = '123456';

async function recreateStaffUsers() {
  console.log('=== 重新创建用户数据 ===\n');

  // 重新创建人员清单中的用户
  console.log('--- 创建用户 ---');
  let successCount = 0;

  for (const staff of staffList) {
    try {
      await createUser({
        userID: staff.userID,
        name: staff.name,
        password: PASSWORD,
        systemRole: staff.role,
        officeLocation: staff.officeLocation === '成都' ? 'Chengdu' : 'Deyang',
        status: staff.status,
        title: staff.title,
        joinDate: staff.joinDate,
        gender: staff.gender,
        education: '',
        school: ''
      });
      console.log(`✓ ${staff.userID} - ${staff.name}`);
      successCount++;
    } catch (error) {
      console.log(`✗ ${staff.userID} - ${staff.name}: 已存在`);
    }
  }

  console.log(`\n=== 完成 ===`);
  console.log(`成功: ${successCount}`);

  // 验证结果
  console.log('\n--- 验证 ---');
  const usersResponse = await request('/api/users?pageSize=100');
  const users = usersResponse.data || [];
  console.log(`用户数: ${users.length}`);

  // 验证中文显示
  const chineseUsers = users.filter(u => /[\u4e00-\u9fa5]/.test(u.name));
  console.log(`中文用户数: ${chineseUsers.length}`);
  if (chineseUsers.length > 0) {
    console.log('示例用户:');
    chineseUsers.slice(0, 3).forEach(u => console.log(`  - ${u.userID}: ${u.name}`));
  }
}

recreateStaffUsers().catch(console.error);
