#!/bin/bash
# 创建测试用户数据
# 1个管理员 + 3个班组长 + 11个组员

API_BASE_URL="${API_BASE_URL:-http://localhost:5001}"

echo "=== 创建测试用户数据 ==="
echo "API地址: $API_BASE_URL"
echo ""

# 创建3个班组长
create_leader() {
    local id=$1
    local name=$2
    local location=$3

    curl -s -X POST "$API_BASE_URL/api/users" \
        -H "Content-Type: application/json" \
        -d "{
            \"userID\": \"$id\",
            \"name\": \"$name\",
            \"password\": \"123456\",
            \"systemRole\": \"LEADER\",
            \"officeLocation\": \"$location\",
            \"status\": \"Active\",
            \"title\": \"班组长\",
            \"education\": \"硕士\",
            \"remark\": \"班组长\"
        }" | jq .
}

# 创建11个组员
create_member() {
    local id=$1
    local name=$2
    local location=$3

    curl -s -X POST "$API_BASE_URL/api/users" \
        -H "Content-Type: application/json" \
        -d "{
            \"userID\": \"$id\",
            \"name\": \"$name\",
            \"password\": \"123456\",
            \"systemRole\": \"MEMBER\",
            \"officeLocation\": \"$location\",
            \"status\": \"Active\",
            \"title\": \"工程师\",
            \"education\": \"本科\"
        }" | jq .
}

echo "--- 创建班组长 ---"
create_leader "zhang" "张组长" "研发中心"
create_leader "wang" "王组长" "设计部"
create_leader "li" "李组长" "测试部"

echo ""
echo "--- 创建组员 ---"
create_member "zhao" "赵工" "研发中心"
create_member "qian" "钱工" "研发中心"
create_member "sun" "孙工" "研发中心"
create_member "zhou" "周工" "研发中心"
create_member "wu" "吴工" "设计部"
create_member "zheng" "郑工" "设计部"
create_member "feng" "冯工" "设计部"
create_member "chen" "陈工" "测试部"
create_member "chu" "楚工" "测试部"
create_member "wei" "魏工" "测试部"
create_member "jiang" "蒋工" "测试部"

echo ""
echo "测试用户创建完成"
echo "登录账号: admin, zhang, wang, li, zhao, qian, sun, zhou, wu, zheng, feng, chen, chu, wei, jiang"
echo "登录密码: admin123 (管理员), 123456 (其他用户)"
