#!/bin/bash
# 一键生成所有测试数据
# 执行顺序: 管理员 -> 测试用户 -> 项目 -> 任务

API_BASE_URL="${API_BASE_URL:-http://localhost:5001}"
SKIP_ADMIN="${SKIP_ADMIN:-false}"

echo "========================================"
echo "  测试数据生成脚本"
echo "========================================"
echo "API地址: $API_BASE_URL"
echo "跳过管理员创建: $SKIP_ADMIN"
echo "========================================"
echo ""

# 等待后端服务就绪
wait_for_api() {
    echo "检查后端服务..."
    for i in {1..30}; do
        if curl -s "$API_BASE_URL/api/health" | grep -q "ok"; then
            echo "后端服务已就绪"
            return 0
        fi
        echo "等待后端服务... ($i/30)"
        sleep 2
    done
    echo "警告: 后端服务未响应，将继续尝试创建数据"
    return 1
}

# 切换到脚本所在目录
cd "$(dirname "$0")"

# 等待后端就绪
wait_for_api

echo ""
echo "========================================"
echo "  1. 创建管理员用户"
echo "========================================"
if [ "$SKIP_ADMIN" != "true" ]; then
    bash create-admin-user.sh
else
    echo "跳过管理员创建"
fi

echo ""
echo "========================================"
echo "  2. 创建测试用户"
echo "========================================"
bash create-test-users.sh

echo ""
echo "========================================"
echo "  3. 创建测试项目"
echo "========================================"
bash create-test-projects.sh

echo ""
echo "========================================"
echo "  4. 创建测试任务"
echo "========================================"
bash create-test-tasks.sh

echo ""
echo "========================================"
echo "  数据生成完成"
echo "========================================"
echo ""
echo "验证数据:"
echo "- 用户数量: $(curl -s "$API_BASE_URL/api/users?pageSize=1000" | jq '.data | length')"
echo "- 项目数量: $(curl -s "$API_BASE_URL/api/projects?pageSize=1000" | jq '.data | length')"
echo "- 任务数量: $(curl -s "$API_BASE_URL/api/tasks?pageSize=1000" | jq '.data | length')"
echo ""
echo "请使用 admin / admin123 登录系统"
