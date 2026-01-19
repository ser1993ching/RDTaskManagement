## ADDED Requirements

### Requirement: API Data Fetching

系统 SHALL 通过后端API获取业务数据，直接使用apiDataService。

#### Scenario: Fetch users from API
- **WHEN** 页面需要加载用户列表
- **THEN** 系统调用后端API `GET /api/users` 获取数据
- **AND** 数据转换为前端User类型格式
- **AND** 用户列表显示在页面上

#### Scenario: Fetch projects from API
- **WHEN** 页面需要加载项目列表
- **THEN** 系统调用后端API `GET /api/projects` 获取数据
- **AND** 数据转换为前端Project类型格式
- **AND** 项目列表显示在页面上

#### Scenario: Fetch tasks from API
- **WHEN** 页面需要加载任务列表
- **THEN** 系统调用后端API `GET /api/tasks` 获取数据
- **AND** 数据转换为前端Task类型格式
- **AND** 任务列表显示在页面上

### Requirement: Async Data Refresh

系统 SHALL 使用异步方式刷新业务数据。

#### Scenario: Refresh all data after login
- **WHEN** 用户登录成功
- **THEN** 系统并行获取用户、项目、任务数据
- **AND** 使用Promise.all提高加载效率
- **AND** 所有数据加载完成后更新界面

#### Scenario: Refresh data after mutation
- **WHEN** 用户执行新建/编辑/删除操作
- **THEN** 操作成功后调用refreshData()
- **THEN** 异步重新获取最新数据
- **AND** 界面自动更新显示最新数据

### Requirement: Data Service Layer

系统 SHALL 使用apiDataService封装数据获取逻辑。

#### Scenario: App component data loading
- **WHEN** App组件初始化
- **THEN** useEffect异步调用refreshData()
- **AND** 数据存储到组件state
- **AND** 子组件通过props接收数据

#### Scenario: Loading state during data fetch
- **WHEN** 数据正在加载
- **THEN** 登录按钮显示loading状态
- **AND** 数据加载完成后loading状态清除
- **AND** 数据加载失败显示错误提示
