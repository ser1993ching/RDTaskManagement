#!/bin/bash
# 创建测试项目数据
# 50个项目，10个类别均匀分布

API_BASE_URL="${API_BASE_URL:-http://localhost:5001}"

echo "=== 创建测试项目数据 ==="
echo "API地址: $API_BASE_URL"
echo ""

# 获取用户列表用于随机分配负责人
USERS=$(curl -s "$API_BASE_URL/api/users?pageSize=100" | jq -r '.data[] | .userID')
USER_ARRAY=($USERS)

# 项目类别
declare -A CATEGORIES
CATEGORIES=(
    ["MARKET"]="市场配合"
    ["EXECUTION"]="常规项目"
    ["NUCLEAR"]="核电项目"
    ["PRODUCT_DEV"]="产品研发"
    ["RESEARCH"]="科研项目"
    ["RENOVATION"]="改造项目"
    ["MEETING_TRAINING"]="会议培训"
    ["ADMIN_PARTY"]="行政与党建"
    ["TRAVEL"]="差旅任务"
    ["OTHER"]="其他"
)

# 机型
MODELS=("QFW-3000" "QFW-2500" "QFW-2000" "QFW-1500" "QFW-1000")

# 容量等级
CAPACITY_LEVELS=("3000MW" "2500MW" "2000MW" "1500MW" "1000MW")

create_project() {
    local category=$1
    local name=$2
    local work_no=$3

    # 随机选择用户
    local random_user=${USER_ARRAY[$((RANDOM % ${#USER_ARRAY[@]}))]}
    local random_model=${MODELS[$((RANDOM % ${#MODELS[@]}))]}
    local random_capacity=${CAPACITY_LEVELS[$((RANDOM % ${#CAPACITY_LEVELS[@]}))]}
    local random_won=$((RANDOM % 2))
    local random_foreign=$((RANDOM % 2))

    # 根据类别调整参数
    local start_date=$(date -d "-$((RANDOM % 180)) days" +%Y-%m-%d)
    local end_date=$(date -d "+$((30 + RANDOM % 180)) days" +%Y-%m-%d)

    local data="{
        \"name\": \"$name\",
        \"category\": \"$category\",
        \"workNo\": \"$work_no\",
        \"startDate\": \"$start_date\",
        \"endDate\": \"$end_date\",
        \"model\": \"$random_model\",
        \"capacity\": \"$random_capacity\",
        \"isWon\": $random_won,
        \"isForeign\": $random_foreign,
        \"remark\": \"测试项目\"
    }"

    if [ "$category" == "MARKET" ]; then
        data=$(echo $data | jq '. + {isWon: true, isForeign: false}')
    fi

    curl -s -X POST "$API_BASE_URL/api/projects" \
        -H "Content-Type: application/json" \
        -d "$data" | jq .id
}

# 创建各类别项目
echo "--- 市场配合 (8个) ---"
for i in {1..8}; do
    create_project "MARKET" "市场项目$i" "MK-2024-$(printf '%03d' $i)"
done

echo "--- 常规项目 (10个) ---"
for i in {1..10}; do
    create_project "EXECUTION" "常规项目$i" "EX-2024-$(printf '%03d' $i)"
done

echo "--- 核电项目 (6个) ---"
for i in {1..6}; do
    create_project "NUCLEAR" "核电项目$i" "NU-2024-$(printf '%03d' $i)"
done

echo "--- 产品研发 (6个) ---"
for i in {1..6}; do
    create_project "PRODUCT_DEV" "研发项目$i" "PD-2024-$(printf '%03d' $i)"
done

echo "--- 科研项目 (5个) ---"
for i in {1..5}; do
    create_project "RESEARCH" "科研项目$i" "RS-2024-$(printf '%03d' $i)"
done

echo "--- 改造项目 (5个) ---"
for i in {1..5}; do
    create_project "RENOVATION" "改造项目$i" "RN-2024-$(printf '%03d' $i)"
done

echo "--- 会议培训 (3个) ---"
for i in {1..3}; do
    create_project "MEETING_TRAINING" "会议培训$i" "MT-2024-$(printf '%03d' $i)"
done

echo "--- 行政与党建 (2个) ---"
for i in {1..2}; do
    create_project "ADMIN_PARTY" "行政党建$i" "AP-2024-$(printf '%03d' $i)"
done

echo "--- 差旅任务 (2个) ---"
for i in {1..2}; do
    create_project "TRAVEL" "差旅任务$i" "TR-2024-$(printf '%03d' $i)"
done

echo "--- 其他 (3个) ---"
for i in {1..3}; do
    create_project "OTHER" "其他$i" "OT-2024-$(printf '%03d' $i)"
done

echo ""
echo "测试项目创建完成，共50个项目"
