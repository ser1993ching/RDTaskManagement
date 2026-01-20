@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "BASE_URL=http://localhost:5000"
set "TOKEN=Bearer mock-jwt-token"

echo === API Test: Create Users ===
echo.

echo 1. Creating user: 胡德剑 (1004889)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1004889\",\"name\":\"胡德剑\",\"systemRole\":\"Member\",\"officeLocation\":\"成都\",\"title\":\"正高级主任工程师\",\"education\":\"本科\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 2. Creating user: 官永胜 (1005184)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1005184\",\"name\":\"官永胜\",\"systemRole\":\"Member\",\"officeLocation\":\"成都\",\"title\":\"主任工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 3. Creating user: 李朝科 (1006279)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1006279\",\"name\":\"李朝科\",\"systemRole\":\"Member\",\"officeLocation\":\"成都\",\"title\":\"主任工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 4. Creating user: 王建立 (1007204)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1007204\",\"name\":\"王建立\",\"systemRole\":\"Member\",\"officeLocation\":\"成都\",\"title\":\"副主任工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 5. Creating user: 张玮 (1007241)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1007241\",\"name\":\"张玮\",\"systemRole\":\"Member\",\"officeLocation\":\"德阳\",\"title\":\"高级工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 6. Creating user: 王黔 (1007465)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1007465\",\"name\":\"王黔\",\"systemRole\":\"Member\",\"officeLocation\":\"德阳\",\"title\":\"副主任工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 7. Creating user: 金媛媛 (1007690)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1007690\",\"name\":\"金媛媛\",\"systemRole\":\"Member\",\"officeLocation\":\"成都\",\"title\":\"副主任工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 8. Creating user: 卢永尧 (1008072)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1008072\",\"name\":\"卢永尧\",\"systemRole\":\"Member\",\"officeLocation\":\"成都\",\"title\":\"副主任工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 9. Creating user: 陈增芬 (1008344)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1008344\",\"name\":\"陈增芬\",\"systemRole\":\"Member\",\"officeLocation\":\"成都\",\"title\":\"高级工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 10. Creating user: 孙青 (1008513)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"1008513\",\"name\":\"孙青\",\"systemRole\":\"Member\",\"officeLocation\":\"德阳\",\"title\":\"高级工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 11. Creating user: 李又超 (3001226) - 班组长
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3001226\",\"name\":\"李又超\",\"systemRole\":\"Leader\",\"officeLocation\":\"成都\",\"title\":\"副主任工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 12. Creating user: 杨迪 (3002681)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3002681\",\"name\":\"杨迪\",\"systemRole\":\"Member\",\"officeLocation\":\"德阳\",\"title\":\"高级工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 13. Creating user: 古曦 (3002684) - 班组长
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3002684\",\"name\":\"古曦\",\"systemRole\":\"Leader\",\"officeLocation\":\"德阳\",\"title\":\"高级工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 14. Creating user: 钟德富 (3002865) - 班组长
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3002865\",\"name\":\"钟德富\",\"systemRole\":\"Leader\",\"officeLocation\":\"德阳\",\"title\":\"高级工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 15. Creating user: 廖亨友 (3003407)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3003407\",\"name\":\"廖亨友\",\"systemRole\":\"Member\",\"officeLocation\":\"成都\",\"title\":\"高级工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 16. Creating user: 蒋群雄 (3004412)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3004412\",\"name\":\"蒋群雄\",\"systemRole\":\"Member\",\"officeLocation\":\"德阳\",\"title\":\"高级工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 17. Creating user: 王雅雯 (3005901)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3005901\",\"name\":\"王雅雯\",\"systemRole\":\"Member\",\"officeLocation\":\"成都\",\"title\":\"工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 18. Creating user: 曹驰健 (3005905)
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3005905\",\"name\":\"曹驰健\",\"systemRole\":\"Member\",\"officeLocation\":\"德阳\",\"title\":\"工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 19. Creating user: 王鸿 (3005922) - 班组长
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3005922\",\"name\":\"王鸿\",\"systemRole\":\"Leader\",\"officeLocation\":\"成都\",\"title\":\"工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo 20. Creating user: 杨巍 (3005925) - 班组长
curl -s -X "%BASE_URL%/api/users" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: %TOKEN%" ^
  -d "{\"userId\":\"3005925\",\"name\":\"杨巍\",\"systemRole\":\"Leader\",\"officeLocation\":\"成都\",\"title\":\"工程师\",\"status\":\"Active\",\"password\":\"123456\"}"
echo.

echo === Creating more users... ===
