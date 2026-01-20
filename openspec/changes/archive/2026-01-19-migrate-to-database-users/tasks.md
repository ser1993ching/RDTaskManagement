## 1. 登录逻辑修改

- [x] 1.1 App.tsx添加登录loading状态变量
- [x] 1.2 handleLogin改为async函数
- [x] 1.3 调用apiDataService.login替代dataService.login
- [x] 1.4 添加try-catch错误处理
- [x] 1.5 处理登录成功后刷新数据
- [x] 1.6 修改登出逻辑，清除auth_token

## 2. 数据获取修改

- [x] 2.1 refreshData改为async函数
- [x] 2.2 使用Promise.all并行获取users, projects, tasks
- [x] 2.3 修改初始加载useEffect，异步调用refreshData
- [x] 2.4 添加数据获取错误处理（静默失败或提示）

## 3. 测试数据生成脚本

- [x] 3.1 创建scripts目录
- [x] 3.2 编写create-admin-user.sh - 创建管理员账号
- [x] 3.3 编写create-test-users.sh - 创建15个测试用户（1管理员+3组长+11组员）
- [x] 3.4 编写create-test-projects.sh - 创建50个测试项目
- [x] 3.5 编写create-test-tasks.sh - 创建135+条测试任务
- [x] 3.6 编写generate-all-test-data.sh - 一键生成所有数据

## 4. 后端验证（手动执行）

- [ ] 4.1 启动后端服务，验证数据库连接
- [ ] 4.2 执行测试数据脚本: `bash scripts/generate-all-test-data.sh`
- [ ] 4.3 验证各API端点返回正确数据

## 5. 前端集成验证（手动执行）

- [ ] 5.1 启动前端开发服务器: `npm run dev`
- [ ] 5.2 使用管理员账号登录 (admin / admin123)
- [ ] 5.3 验证仪表盘显示统计数据
- [ ] 5.4 验证人员管理显示用户列表
- [ ] 5.5 验证项目管理显示项目列表
- [ ] 5.6 验证任务管理显示任务列表
- [ ] 5.7 验证新建/编辑/删除功能

## 6. 清理和优化

- [x] 6.1 标记dataService中不再使用的方法（添加@deprecated注释）
- [x] 6.2 移除localStorage中的rd_users, rd_projects, rd_tasks初始数据逻辑
- [x] 6.3 删除unifiedDataService.ts文件（不再使用）
- [x] 6.4 文档化API端点地址配置（VITE_API_URL）

## 使用说明

### 环境变量配置
在 `.env` 文件中配置:
```
VITE_API_URL=http://localhost:5001
```

### 生成测试数据
```bash
# 设置API地址（可选，默认localhost:5001）
export API_BASE_URL=http://localhost:5001

# 一键生成所有测试数据
bash scripts/generate-all-test-data.sh

# 或分步执行
bash scripts/create-admin-user.sh
bash scripts/create-test-users.sh
bash scripts/create-test-projects.sh
bash scripts/create-test-tasks.sh
```

### 登录账号
- 管理员: admin / admin123
- 其他用户: [用户名] / 123456
