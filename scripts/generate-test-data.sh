#!/bin/bash
# 测试数据生成脚本
# 用于生成用户、项目、任务测试数据

API_BASE="http://localhost:5001"

echo "========================================"
echo "开始生成测试数据..."
echo "========================================"

# 生成随机日期（过去12个月内）
generate_date() {
    local days_ago=$((RANDOM % 365))
    date -d "$days_ago days ago" +%Y-%m-%d 2>/dev/null || {
        date -v-${days_ago}d +%Y-%m-%d 2>/dev/null
    }
}

# 生成UUID
generate_uuid() {
    cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen 2>/dev/null || echo "test-$(date +%s)-$(shuf -i 1-999999 -n 1)"
}

# 1. 生成用户 (15个)
echo ""
echo "=== 生成用户数据 (15个) ==="

# 管理员
curl -s -X POST "$API_BASE/api/users" \
    -H "Content-Type: application/json" \
    -d '{
        "userID": "admin",
        "name": "系统管理员",
        "systemRole": "Admin",
        "officeLocation": "Chengdu",
        "status": "Active",
        "title": "系统管理员",
        "password": "admin123"
    }' > /dev/null
echo "✓ 创建管理员 admin"

# 组长 (3个)
LEADER_IDS=()
for i in {1..3}; do
    USER_ID="LEADER$(printf '%03d' $i)"
    LEADER_IDS+=("$USER_ID")
    curl -s -X POST "$API_BASE/api/users" \
        -H "Content-Type: application/json" \
        -d "{
            \"userID\": \"$USER_ID\",
            \"name\": \"张组长$i\",
            \"systemRole\": \"Leader\",
            \"officeLocation\": \"Deyang\",
            \"status\": \"Active\",
            \"title\": \"主任工程师\",
            \"password\": \"123456\"
        }" > /dev/null
    echo "✓ 创建组长 $USER_ID"
done

# 组员 (11个)
MEMBER_IDS=()
for i in {1..11}; do
    USER_ID="USER$(printf '%03d' $i)"
    MEMBER_IDS+=("$USER_ID")
    LOCATION=$(shuf -e "Chengdu" "Deyang" -n 1)
    curl -s -X POST "$API_BASE/api/users" \
        -H "Content-Type: application/json" \
        -d "{
            \"userID\": \"$USER_ID\",
            \"name\": \"李成员$i\",
            \"systemRole\": \"Member\",
            \"officeLocation\": \"$LOCATION\",
            \"status\": \"Active\",
            \"title\": \"工程师\",
            \"password\": \"123456\"
        }" > /dev/null
    echo "✓ 创建成员 $USER_ID"
done

# 2. 生成项目 (50个)
# 使用有效的项目类别: Market, Execution, Nuclear, Research, Renovation, Other
echo ""
echo "=== 生成项目数据 (50个) ==="

# 扩展类别映射：脚本使用的名称 -> API期望的名称
declare -A CATEGORY_MAP=(
    ["MARKET"]="Market"
    ["EXECUTION"]="Execution"
    ["NUCLEAR"]="Nuclear"
    ["PRODUCT_DEV"]="Other"
    ["RESEARCH"]="Research"
    ["RENOVATION"]="Renovation"
    ["MEETING_TRAINING"]="Other"
    ["ADMIN_PARTY"]="Other"
    ["TRAVEL"]="Other"
    ["OTHER"]="Other"
)

PROJECT_CATEGORIES=("MARKET" "EXECUTION" "NUCLEAR" "RESEARCH" "RENOVATION" "OTHER")
PROJECT_COUNTS=(10 12 8 8 7 5)  # 每类数量

PROJECT_IDS=()

for idx in "${!PROJECT_CATEGORIES[@]}"; do
    SCRIPT_CATEGORY="${PROJECT_CATEGORIES[$idx]}"
    API_CATEGORY="${CATEGORY_MAP[$SCRIPT_CATEGORY]}"
    COUNT="${PROJECT_COUNTS[$idx]}"

    for i in $(seq 1 $COUNT); do
        PROJECT_ID="P-${SCRIPT_CATEGORY}-$(printf '%03d' $i)"
        PROJECT_IDS+=("$PROJECT_ID")

        START_DATE=$(generate_date)
        END_DATE=$(date -d "$START_DATE + 90 days" +%Y-%m-%d 2>/dev/null || {
            local start_ts=$(date -d "$START_DATE" +%s 2>/dev/null || date -jf "%Y-%m-%d" "$START_DATE" +%s)
            local end_ts=$((start_ts + 90 * 24 * 60 * 60))
            date -jf "%s" "$end_ts" +%Y-%m-%d 2>/dev/null || echo "2025-12-31"
        })

        case $SCRIPT_CATEGORY in
            "MARKET")
                CAPACITY=$(shuf -e "300MW" "500MW" "800MW" "1000MW" "1200MW" -n 1)
                MODEL=$(shuf -e "Francis" "Kaplan" "Pelton" -n 1)
                IS_WON=$([ $((RANDOM % 2)) -eq 0 ] && echo "true" || echo "false")
                IS_FOREIGN=$([ $((RANDOM % 3)) -eq 0 ] && echo "true" || echo "false")
                curl -s -X POST "$API_BASE/api/projects" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"name\": \"${SCRIPT_CATEGORY}项目-$i\",
                        \"category\": \"$API_CATEGORY\",
                        \"workNo\": \"${SCRIPT_CATEGORY}-2025-$(printf '%03d' $i)\",
                        \"capacity\": \"$CAPACITY\",
                        \"model\": \"$MODEL\",
                        \"startDate\": \"$START_DATE\",
                        \"endDate\": \"$END_DATE\",
                        \"isWon\": $IS_WON,
                        \"isForeign\": $IS_FOREIGN
                    }" > /dev/null
                ;;
            *)
                curl -s -X POST "$API_BASE/api/projects" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"name\": \"${SCRIPT_CATEGORY}项目-$i\",
                        \"category\": \"$API_CATEGORY\",
                        \"workNo\": \"${SCRIPT_CATEGORY}-2025-$(printf '%03d' $i)\",
                        \"startDate\": \"$START_DATE\",
                        \"endDate\": \"$END_DATE\"
                    }" > /dev/null
                ;;
        esac
        echo "✓ 创建项目 $PROJECT_ID ($API_CATEGORY)"
    done
done

# 3. 生成任务 (135个)
echo ""
echo "=== 生成任务数据 (135个) ==="

TASK_CLASSES=("TC001" "TC002" "TC003" "TC004" "TC005" "TC006" "TC007" "TC008" "TC009" "TC010")
TASK_COUNTS=(15 20 15 15 15 15 10 10 10 10)  # 每类数量
TASK_STATUSES=("NotStarted" "Drafting" "InProgress" "Revising" "Completed")
SUB_CATEGORIES_MAP='{"TC001": "[\"标书\", \"复询\", \"技术支持\", \"其他\"]", "TC002": "[\"搭建生产资料\", \"设计院提资\", \"CT配合与提资\", \"随机资料\", \"项目特殊项处理\", \"用户配合\", \"图纸会签\", \"传真回复\", \"其他\"]", "TC003": "[\"核电设计\", \"核安全审评\", \"设备调试\", \"常规岛配合\", \"核岛接口\", \"技术支持\", \"其他\"]", "TC004": "[\"技术支持\", \"设计流程\", \"方案评审\", \"专利申请\", \"出图\", \"图纸改版\", \"设计总结\"]", "TC005": "[\"开题报告\", \"专利申请\", \"结题报告\", \"其他\"]", "TC006": "[\"前期项目配合\", \"方案编制\", \"其他\"]", "TC007": "[\"学习与培训\", \"党建会议\", \"班务会\", \"设计评审会\", \"资料讨论会\", \"其他\"]", "TC008": "[\"报表填报\", \"ppt汇报\", \"总结报告\", \"其他\"]", "TC009": "[\"市场配合出差\", \"常规项目执行出差\", \"核电项目执行出差\", \"科研出差\", \"改造服务出差\", \"其他任务出差\"]", "TC010": "[\"通用任务\"]"}'

for idx in "${!TASK_CLASSES[@]}"; do
    TASK_CLASS="${TASK_CLASSES[$idx]}"
    COUNT="${TASK_COUNTS[$idx]}"

    # 获取子类别列表
    SUB_CATS_JSON=$(echo "$SUB_CATEGORIES_MAP" | python3 -c "import sys, json; print(json.load(sys.stdin).get('$TASK_CLASS', '[\"其他\"]'))" 2>/dev/null || echo '["其他"]')

    for i in $(seq 1 $COUNT); do
        TASK_ID="T-$(generate_uuid | head -c 8)"

        # 随机分配用户
        ASSIGNEE_ID=$(shuf -e "${LEADER_IDS[@]}" "${MEMBER_IDS[@]}" -n 1)
        CHECKER_ID=$(shuf -e "${LEADER_IDS[@]}" -n 1)
        CHIEF_DESIGNER_ID=$(shuf -e "${LEADER_IDS[@]}" -n 1)
        APPROVER_ID=$(shuf -e "${LEADER_IDS[@]}" -n 1)
        CREATED_BY=$(shuf -e "${LEADER_IDS[@]}" -n 1)

        # 随机选择子类别
        SUB_CAT=$(echo "$SUB_CATS_JSON" | python3 -c "import sys, json; cats=json.loads(sys.stdin.read()); import random; print(random.choice(cats))" 2>/dev/null || echo "其他")

        START_DATE=$(generate_date)
        DUE_DAYS=$((RANDOM % 30 + 1))
        DUE_DATE=$(date -d "$START_DATE + $DUE_DAYS days" +%Y-%m-%d 2>/dev/null || {
            local start_ts=$(date -d "$START_DATE" +%s 2>/dev/null || date -jf "%Y-%m-%d" "$START_DATE" +%s)
            local end_ts=$((start_ts + DUE_DAYS * 24 * 60 * 60))
            date -jf "%s" "$end_ts" +%Y-%m-%d 2>/dev/null || echo "2025-12-31"
        })

        STATUS=$(shuf -e "${TASK_STATUSES[@]}" -n 1)
        WORKLOAD=$((RANDOM % 80 + 10))
        DIFFICULTY_NUM=$((RANDOM % 20 + 5))
        DIFFICULTY="${DIFFICULTY_NUM}.$((RANDOM % 10))"
        RANDOM_PROJECT_ID=$(shuf -e "${PROJECT_IDS[@]}" -n 1)

        # 根据任务类型构建不同的请求体
        case $TASK_CLASS in
            "TC009")  # 差旅任务
                TRAVEL_LOCATION=$(shuf -e "北京" "上海" "广州" "成都" "武汉" "西安" "国外项目现场" -n 1)
                TRAVEL_DURATION=$((RANDOM % 10 + 1))
                curl -s -X POST "$API_BASE/api/tasks" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"taskName\": \"差旅-${TASK_CLASS}-$i\",
                        \"taskClassID\": \"$TASK_CLASS\",
                        \"category\": \"$SUB_CAT\",
                        \"assigneeID\": \"$ASSIGNEE_ID\",
                        \"assigneeName\": \"$ASSIGNEE_ID\",
                        \"checkerID\": \"$CHECKER_ID\",
                        \"chiefDesignerID\": \"$CHIEF_DESIGNER_ID\",
                        \"approverID\": \"$APPROVER_ID\",
                        \"startDate\": \"$START_DATE\",
                        \"dueDate\": \"$DUE_DATE\",
                        \"status\": \"$STATUS\",
                        \"workload\": $WORKLOAD,
                        \"difficulty\": $DIFFICULTY,
                        \"travelLocation\": \"$TRAVEL_LOCATION\",
                        \"travelDuration\": $TRAVEL_DURATION,
                        \"travelLabel\": \"市场配合出差\",
                        \"createdBy\": \"$CREATED_BY\"
                    }" > /dev/null
                ;;
            "TC007")  # 会议任务
                MEETING_DURATION=$((RANDOM % 8 + 1))
                curl -s -X POST "$API_BASE/api/tasks" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"taskName\": \"会议-${TASK_CLASS}-$i\",
                        \"taskClassID\": \"$TASK_CLASS\",
                        \"category\": \"$SUB_CAT\",
                        \"assigneeID\": \"$ASSIGNEE_ID\",
                        \"assigneeName\": \"$ASSIGNEE_ID\",
                        \"checkerID\": \"$CHECKER_ID\",
                        \"chiefDesignerID\": \"$CHIEF_DESIGNER_ID\",
                        \"approverID\": \"$APPROVER_ID\",
                        \"startDate\": \"$START_DATE\",
                        \"dueDate\": \"$DUE_DATE\",
                        \"status\": \"$STATUS\",
                        \"workload\": $WORKLOAD,
                        \"difficulty\": $DIFFICULTY,
                        \"meetingDuration\": $MEETING_DURATION,
                        \"createdBy\": \"$CREATED_BY\"
                    }" > /dev/null
                ;;
            *)
                curl -s -X POST "$API_BASE/api/tasks" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"taskName\": \"任务-${TASK_CLASS}-$i\",
                        \"taskClassID\": \"$TASK_CLASS\",
                        \"category\": \"$SUB_CAT\",
                        \"projectID\": \"$RANDOM_PROJECT_ID\",
                        \"assigneeID\": \"$ASSIGNEE_ID\",
                        \"assigneeName\": \"$ASSIGNEE_ID\",
                        \"checkerID\": \"$CHECKER_ID\",
                        \"chiefDesignerID\": \"$CHIEF_DESIGNER_ID\",
                        \"approverID\": \"$APPROVER_ID\",
                        \"startDate\": \"$START_DATE\",
                        \"dueDate\": \"$DUE_DATE\",
                        \"status\": \"$STATUS\",
                        \"workload\": $WORKLOAD,
                        \"difficulty\": $DIFFICULTY,
                        \"createdBy\": \"$CREATED_BY\"
                    }" > /dev/null
                ;;
        esac

        echo "✓ 创建任务 $TASK_ID ($TASK_CLASS)"
    done
done

echo ""
echo "========================================"
echo "测试数据生成完成！"
echo "========================================"
echo ""
echo "生成的测试数据统计："
echo "  - 用户: 15个 (1管理员 + 3组长 + 11组员)"
echo "  - 项目: 50个 (6个类别)"
echo "  - 任务: 135个 (10个类别，时间跨度12个月)"
echo ""
echo "API测试地址: $API_BASE"
echo "Swagger文档: $API_BASE/swagger"
