@echo off
chcp 65001 >nul
set API_BASE=http://localhost:5001

echo ========================================
echo Start generating test data...
echo ========================================

echo.
echo === Generate Users (15) ===

for /l %%i in (1,1,3) do (
    set UID=LEADER%%i
    echo Creating leader !UID!...
    curl -s -X POST "%API_BASE%/api/users" -H "Content-Type: application/json" -d "{\"userID\":\"!UID!\",\"name\":\"Zhang%%i\",\"systemRole\":\"Leader\",\"officeLocation\":\"Deyang\",\"status\":\"Active\",\"title\":\"Chief\",\"password\":\"123456\"}"
)

for /l %%i in (1,1,11) do (
    set UID=USER%%i
    if %%i equ 1 set LOC=Chengdu
    if %%i neq 1 set LOC=Deyang
    echo Creating member !UID!...
    curl -s -X POST "%API_BASE%/api/users" -H "Content-Type: application/json" -d "{\"userID\":\"!UID!\",\"name\":\"Li%%i\",\"systemRole\":\"Member\",\"officeLocation\":\"%LOC%\",\"status\":\"Active\",\"title\":\"Engineer\",\"password\":\"123456\"}"
)

echo.
echo === Generate Projects (50) ===

set PROJ[0]=Market&set PROJ_CNT[0]=10
set PROJ[1]=Execution&set PROJ_CNT[1]=12
set PROJ[2]=Nuclear&set PROJ_CNT[2]=8
set PROJ[3]=Research&set PROJ_CNT[3]=8
set PROJ[4]=Renovation&set PROJ_CNT[4]=7
set PROJ[5]=Other&set PROJ_CNT[5]=5

for /l %%k in (0,1,5) do (
    for /l %%i in (1,1,!PROJ_CNT[%%k]!) do (
        set PID=P-!PROJ[%%k]!-00%%i
        if "!PROJ[%%k]!"=="Market" (
            curl -s -X POST "%API_BASE%/api/projects" -H "Content-Type: application/json" -d "{\"name\":\"!PROJ[%%k]!Project%%i\",\"category\":\"!PROJ[%%k]!\",\"workNo\":\"!PROJ[%%k]!-2025-00%%i\",\"capacity\":\"300MW\",\"model\":\"Francis\",\"startDate\":\"2025-01-01\",\"endDate\":\"2025-12-31\",\"isWon\":true,\"isForeign\":false}"
        ) else (
            curl -s -X POST "%API_BASE%/api/projects" -H "Content-Type: application/json" -d "{\"name\":\"!PROJ[%%k]!Project%%i\",\"category\":\"!PROJ[%%k]!\",\"workNo\":\"!PROJ[%%k]!-2025-00%%i\",\"startDate\":\"2025-01-01\",\"endDate\":\"2025-12-31\"}"
        )
        echo Created project !PID!
    )
)

echo.
echo === Generate Tasks (135) ===

set TASK[0]=TC001&set TASK_CNT[0]=15
set TASK[1]=TC002&set TASK_CNT[1]=20
set TASK[2]=TC003&set TASK_CNT[2]=15
set TASK[3]=TC004&set TASK_CNT[3]=15
set TASK[4]=TC005&set TASK_CNT[4]=15
set TASK[5]=TC006&set TASK_CNT[5]=15
set TASK[6]=TC007&set TASK_CNT[6]=10
set TASK[7]=TC008&set TASK_CNT[7]=10
set TASK[8]=TC009&set TASK_CNT[8]=10
set TASK[9]=TC010&set TASK_CNT[9]=10

for /l %%k in (0,1,9) do (
    for /l %%i in (1,1,!TASK_CNT[%%k]!) do (
        set TID=T-0000000%%i
        set BODY={"taskName":"Task!TASK[%%k]!_%%i","taskClassID":"!TASK[%%k]!","category":"Cat1","projectID":"P-Market-001","assigneeID":"LEADER001","assigneeName":"LEADER001","checkerID":"LEADER001","chiefDesignerID":"LEADER001","approverID":"LEADER001","startDate":"2025-01-01","dueDate":"2025-12-31","status":"InProgress","workload":50,"difficulty":"1.5","createdBy":"LEADER001"}

        if "!TASK[%%k]!"=="TC009" (
            set BODY={"taskName":"Travel!TASK[%%k]!_%%i","taskClassID":"!TASK[%%k]!","category":"Cat1","assigneeID":"LEADER001","assigneeName":"LEADER001","checkerID":"LEADER001","chiefDesignerID":"LEADER001","approverID":"LEADER001","startDate":"2025-01-01","dueDate":"2025-12-31","status":"InProgress","workload":50,"difficulty":"1.5","travelLocation":"Beijing","travelDuration":5,"travelLabel":"MarketTravel","createdBy":"LEADER001"}
        )
        if "!TASK[%%k]!"=="TC007" (
            set BODY={"taskName":"Meeting!TASK[%%k]!_%%i","taskClassID":"!TASK[%%k]!","category":"Cat1","assigneeID":"LEADER001","assigneeName":"LEADER001","checkerID":"LEADER001","chiefDesignerID":"LEADER001","approverID":"LEADER001","startDate":"2025-01-01","dueDate":"2025-12-31","status":"InProgress","workload":50,"difficulty":"1.5","meetingDuration":2,"createdBy":"LEADER001"}
        )

        curl -s -X POST "%API_BASE%/api/tasks" -H "Content-Type: application/json" -d "!BODY!"
        echo Created task !TID!
    )
)

echo.
echo ========================================
echo Test data generation completed!
echo ========================================
echo API: %API_BASE%
echo Swagger: %API_BASE%/swagger
