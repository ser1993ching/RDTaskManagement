/**
 * 重置所有用户密码为123
 */

const BASE_URL = 'http://localhost:5001';

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

async function resetAllPasswords(token) {
  console.log('获取用户列表...');
  const response = await fetchApi('/api/users?pageSize=1000', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const users = response.data || [];

  console.log(`找到 ${users.length} 个用户`);

  let successCount = 0;
  for (const user of users) {
    try {
      // 重置用户密码
      await fetchApi(`/api/users/${user.userID}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: '123' }),
      });
      console.log(`✓ ${user.userID} - ${user.name}: 密码已重置为 123`);
      successCount++;
    } catch (error) {
      console.error(`✗ ${user.userID} - ${user.name}: ${error.message}`);
    }
  }

  console.log(`\n成功重置 ${successCount}/${users.length} 个用户密码`);
}

async function main() {
  try {
    const token = await login();
    await resetAllPasswords(token);
    console.log('\n=== 完成 ===');
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

main();
