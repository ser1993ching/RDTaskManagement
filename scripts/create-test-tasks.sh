#!/bin/bash
# 创建测试任务数据
# 135+个任务，10个类别均匀分布

API_BASE_URL="${API_BASE_URL:-http://localhost:5001}"

echo "=== 创建测试任务数据 ==="
echo "API地址: $API_BASE_URL"
echo ""

# 获取用户和项目列表
USERS=$(curl -s "$API_BASE_URL/api/users?pageSize=100" | jq -r '.data[] | .userID')
USER_ARRAY=($USERS)

PROJECTS=$(curl -s "$API_BASE_URL/api/projects?pageSize=100" | jq -r '.data[] | .id')
PROJECT_ARRAY=($PROJECTS)

# 任务类别
TASK_CLASSES=("TC001" "TC002" "TC003" "TC004" "TC005" "TC006" "TC007" "TC008" "TC009" "TC010")

# 任务状态
STATUSES=("Pending" "InProgress" "Review" "Completed")

# 难度等级
DIFFICULTIES=("Low" "Medium" "High" "VeryHigh")

# 子类别映射
declare -A SUBCATEGORIES
SUBCATEGORIES=(
    ["TC001"]="投标配合,技术支持,方案设计"
    ["TC002"]="设计开发,计算分析,图纸绘制,技术评审"
    ["TC003"]="安全审查,设计验证,技术支持"
    ["TC004"]="原型设计,测试验证,工艺改进"
    ["TC005"]="理论研究,试验验证,专利申报"
    ["TC006"]="现场测绘,方案改造,施工监督"
    ["TC007"]="部门会议,培训学习,经验交流"
    ["TC008"]="党建工作,行政事务,文化建设"
    ["TC009"]="出差汇报,现场支持,技术交流"
    ["TC010"]="其他任务"
)

# 差旅地点
TRAVEL_LOCATIONS=("北京,上海,广州,深圳,杭州,成都,武汉,西安")

create_task() {
    local task_class=$1
    local task_name=$2

    # 随机选择用户
    local assignee=${USER_ARRAY[$((RANDOM % ${#USER_ARRAY[@]}))]}
    local checker=${USER_ARRAY[$((RANDOM % ${#USER_ARRAY[@]}))]}
    local random_status=${STATUSES[$((RANDOM % ${#STATUSES[@]}))]}
    local random_difficulty=${DIFFICULTIES[$((RANDOM % ${#DIFFICULTIES[@]}))]}
    local random_workload=$((1 + RANDOM % 10))

    # 随机选择项目
    local project_id=""
    if [ ${#PROJECT_ARRAY[@]} -gt 0 ]; then
        project_id=${PROJECT_ARRAY[$((RANDOM % ${#PROJECT_ARRAY[@]}))]}
    fi

    # 根据类别调整参数
    local start_date=$(date -d "-$((RANDOM % 180)) days" +%Y-%m-%d)
    local due_date=$(date -d "+$((7 + RANDOM % 60)) days" +%Y-%m-%d)
    local created_date=$(date -d "-$((RANDOM % 200)) days" +%Y-%m-%d)

    # 获取子类别
    local subcats="${SUBCATEGORIES[$task_class]}"
    local subcategory=$(echo "$subcats" | tr ',' '\n' | shuf | head -1)

    local data="{
        \"taskName\": \"$task_name\",
        \"taskClassID\": \"$task_class\",
        \"category\": \"$subcategory\",
        \"projectID\": \"$project_id\",
        \"assigneeID\": \"$assignee\",
        \"assigneeName\": \"\",
        \"startDate\": \"$start_date\",
        \"dueDate\": \"$due_date\",
        \"status\": \"$random_status\",
        \"workload\": $random_workload,
        \"difficulty\": \"$random_difficulty\",
        \"createdDate\": \"$created_date\",
        \"checkerID\": \"$checker\",
        \"checkerWorkload\": $((1 + RANDOM % 5))
    }"

    # 特殊类别添加特殊字段
    if [ "$task_class" == "TC007" ]; then
        # 会议培训
        data=$(echo $data | jq '. + {meetingDuration: '$(($(($RANDOM % 4)) + 1))', participants: [], participantNames: []}')
    elif [ "$task_class" == "TC009" ]; then
        # 差旅任务
        local travel_location=$(echo "$TRAVEL_LOCATIONS" | tr ',' '\n' | shuf | head -1)
        data=$(echo $data | jq ". + {travelLocation: \"$travel_location\", travelDuration: $(($(($RANDOM % 10)) + 1)), travelLabel: \"出差支持\"}")
    fi

    curl -s -X POST "$API_BASE_URL/api/tasks" \
        -H "Content-Type: application/json" \
        -d "$data" | jq .taskID
}

# 创建各类别任务
echo "--- TC001 市场配合 (15个) ---"
for i in {1..15}; do
    create_task "TC001" "市场配合任务$i"
done

echo "--- TC002 常规项目 (20个) ---"
for i in {1..20}; do
    create_task "TC002" "常规任务$i"
done

echo "--- TC003 核电项目 (15个) ---"
for i in {1..15}; do
    create_task "TC003" "核电任务$i"
done

echo "--- TC004 产品研发 (15个) ---"
for i in {1..15}; do
    create_task "TC004" "研发任务$i"
done

echo "--- TC005 科研项目 (12个) ---"
for i in {1..12}; do
    create_task "TC005" "科研任务$i"
done

echo "--- TC006 改造项目 (12个) ---"
for i in {1..12}; do
    create_task "TC006" "改造任务$i"
done

echo "--- TC007 会议培训 (10个) ---"
for i in {1..10}; do
    create_task "TC007" "会议培训$i"
done

echo "--- TC008 行政党建 (8个) ---"
for i in {1..8}; do
    create_task "TC008" "行政党建任务$i"
done

echo "--- TC009 差旅任务 (10个) ---"
for i in {1..10}; do
    create_task "TC009" "差旅任务$i"
done

echo "--- TC010 其他任务 (18个) ---"
for i in {1..18}; do
    create_task "TC010" "其他任务$i"
done

echo ""
echo "测试任务创建完成，共135个任务"
