# 实现设置功能前后端集成

## 摘要

原前端 demo 中可通过设置对系统进行配置，目前前端设置页面不可配置（使用 localStorage 的 dataService），后端系统未完成功能匹配。本变更旨在实现设置功能的前后端集成，使设置数据持久化到数据库。

## 背景与目标

### 背景
- 前端 Settings.tsx 组件完整实现了设置界面，但使用 dataService 操作 localStorage
- 后端 SettingsController 提供了部分 API，但缺少任务类别管理 API
- 设置数据目前存储在 localStorage，重启后数据丢失

### 目标
1. 完善后端设置 API（添加任务类别管理）
2. 改造前端 Settings.tsx 调用后端 API
3. 设置数据持久化到 MySQL 数据库
4. 保持用户体验一致

## 范围

### 包含
- 任务类别管理（TaskClass）CRUD API
- 任务分类管理（TaskCategory）API
- 前端 Settings.tsx API 集成
- 数据库表创建/迁移

### 不包含
- 用户认证/授权改造（已有）
- 任务管理相关设置（已有）
