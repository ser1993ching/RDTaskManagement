## ADDED Requirements

### Requirement: Database User Authentication

系统 SHALL 使用数据库users表中的用户进行身份验证，而非localStorage内存用户。

#### Scenario: Successful login with database user
- **WHEN** 用户提交登录表单（userId和password）
- **THEN** 系统调用后端API `POST /api/auth/login` 验证凭据
- **AND** 验证成功后返回JWT Token和用户信息
- **AND** 系统将Token存储到localStorage的`auth_token`键
- **AND** 用户登录成功，显示主界面

#### Scenario: Failed login with invalid credentials
- **WHEN** 用户提交错误的用户名或密码
- **THEN** 后端API返回认证失败错误
- **THEN** 系统显示"用户名或密码错误"提示
- **AND** 用户保持在登录页面

#### Scenario: Login with empty database
- **WHEN** 数据库users表为空
- **THEN** 系统自动创建默认管理员用户（userID: admin, password: admin123）
- **AND** 用户可使用默认管理员登录

### Requirement: JWT Token Management

系统 SHALL 通过JWT Token维护用户会话。

#### Scenario: Token stored on login
- **WHEN** 用户登录成功
- **THEN** 系统将JWT Token存储到localStorage
- **AND** 后续API请求自动携带Token

#### Scenario: Token cleared on logout
- **WHEN** 用户点击登出
- **THEN** 系统清除localStorage中的auth_token
- **AND** 用户返回登录页面
- **AND** 所有API客户端的Token被清除

#### Scenario: Token included in API requests
- **WHEN** 前端发起API请求
- **THEN** 请求头自动包含 `Authorization: Bearer <token>`
- **AND** 后端验证Token有效性

### Requirement: Login Flow

系统 SHALL 使用表单提交方式处理用户登录请求，提供loading状态和错误提示。

#### Scenario: Login form submission
- **WHEN** 用户提交登录表单
- **THEN** 显示loading状态防止重复提交
- **AND** 异步调用登录API
- **AND** 登录成功后异步加载业务数据
- **AND** 登录失败显示错误信息
