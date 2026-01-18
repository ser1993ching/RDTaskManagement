// 测试姓名登录
const BASE_URL = 'http://localhost:5001';

async function testLogin() {
  // 测试用姓名登录
  const testCases = [
    { userId: '胡德剑', password: '123' },
    { userId: '张组长', password: '123' },
    { userId: 'admin', password: '123' },
  ];

  for (const test of testCases) {
    try {
      console.log(`\n测试登录: ${test.userId} / ${test.password}`);
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test),
      });

      const result = await response.json();
      if (result.success) {
        console.log(`✓ 登录成功: ${result.data.user.name} (${result.data.user.userID})`);
      } else {
        console.log(`✗ 登录失败: ${result.error?.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`✗ 请求失败: ${error.message}`);
    }
  }
}

testLogin();
