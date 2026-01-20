/**
 * 用户登录验证脚本
 * 测试人员清单中所有用户能否使用密码 123456 登录
 */

const users = [
  { id: '1004889', name: '胡德剑' },
  { id: '1005184', name: '官永胜' },
  { id: '1006279', name: '李朝科' },
  { id: '1007204', name: '王建立' },
  { id: '1007241', name: '张玮' },
  { id: '1007465', name: '王黔' },
  { id: '1007690', name: '金媛媛' },
  { id: '1008072', name: '卢永尧' },
  { id: '1008344', name: '陈增芬' },
  { id: '1008513', name: '孙青' },
  { id: '3001226', name: '李又超' },
  { id: '3002681', name: '杨迪' },
  { id: '3002684', name: '古曦' },
  { id: '3002865', name: '钟德富' },
  { id: '3003407', name: '廖亨友' },
  { id: '3004412', name: '蒋群雄' },
  { id: '3005901', name: '王雅雯' },
  { id: '3005905', name: '曹驰健' },
  { id: '3005922', name: '王鸿' },
  { id: '3005925', name: '杨巍' },
  { id: '3006612', name: '黄鑫' },
  { id: '3007213', name: '王可欣' },
  { id: '3007227', name: '苏文博' },
  { id: '3008172', name: '樊嘉豪' },
  { id: '3008231', name: '李典' },
  { id: '3009101', name: '刘林涵' },
  { id: '3010363', name: '刘咏芳' },
  { id: '3010758', name: '魏宇航' },
  { id: '3010862', name: '贺向东' },
  { id: '3012527', name: '杨飞越' },
  { id: '3012524', name: '徐青青' },
  { id: '3012478', name: '牟星宇' },
  { id: '3012451', name: '郑典涛' },
  { id: '3012535', name: '盛晋银' },
  { id: '3014242', name: '罗欢' },
  { id: '3014388', name: '郑淇文' },
  { id: '3014531', name: '杨攀' },
  { id: '3014253', name: '黄泽奇' },
  { id: '3014229', name: '曾一涛' },
];

async function testLogin(userId, name) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserId: userId, Password: '123456' })
    });
    const data = await response.json();
    if (data.Success) {
      return { success: true, role: data.Data.User.SystemRole };
    } else {
      return { success: false, error: data.Error?.Message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('用户登录验证测试');
  console.log('='.repeat(60));
  console.log(`测试用户数: ${users.length}`);
  console.log(`密码: 123456`);
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;
  const failedUsers = [];

  for (const user of users) {
    const result = await testLogin(user.id, user.name);
    const status = result.success ? '✓' : '✗';
    const role = result.success ? `(${result.role})` : '';
    console.log(`${status} ${user.id} ${user.name} ${role}`);

    if (result.success) {
      passed++;
    } else {
      failed++;
      failedUsers.push({ ...user, error: result.error });
    }
  }

  console.log('='.repeat(60));
  console.log(`结果: ${passed} 成功, ${failed} 失败`);
  console.log('='.repeat(60));

  if (failedUsers.length > 0) {
    console.log('\n失败用户:');
    failedUsers.forEach(u => {
      console.log(`  ${u.id} ${u.name}: ${u.error}`);
    });
  }
}

runTests();
