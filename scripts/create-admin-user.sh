#!/bin/bash
# 创建管理员用户
# 默认账号: admin / admin123

API_BASE_URL="${API_BASE_URL:-http://localhost:5001}"

echo "=== 创建管理员用户 ==="
echo "API地址: $API_BASE_URL"
echo ""

# 创建管理员
curl -s -X POST "$API_BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "userID": "admin",
    "name": "管理员",
    "password": "admin123",
    "systemRole": "ADMIN",
    "officeLocation": "研发中心",
    "status": "Active",
    "title": "系统管理员",
    "education": "本科",
    "school": "清华大学",
    "remark": "系统管理员账号"
  }' | jq .

echo ""
echo "管理员用户创建完成"
echo "登录账号: admin"
echo "登录密码: admin123"
