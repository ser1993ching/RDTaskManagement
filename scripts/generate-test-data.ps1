#!/usr/bin/env pwsh
# Simple Test Data Generation Script

$API_BASE = "http://localhost:5001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Start generating test data..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Generate Users
Write-Host ""
Write-Host "=== Generate Users (15) ===" -ForegroundColor Yellow

$LEADER_IDS = @()
for ($i = 1; $i -le 3; $i++) {
    $USER_ID = "LEADER{0:D3}" -f $i
    $LEADER_IDS += $USER_ID
    $body = "{{`"userID`":`"$USER_ID`",`"name`":`"Zhang$i`",`"systemRole`":`"Leader`",`"officeLocation`":`"Deyang`",`"status`":`"Active`",`"title`":`"Chief`",`"password`":`"123456`"}}"
    $null = curl -s -X POST "$API_BASE/api/users" -H "Content-Type: application/json" -d $body
    Write-Host "  Created leader $USER_ID" -ForegroundColor Green
}

$MEMBER_IDS = @()
for ($i = 1; $i -le 11; $i++) {
    $USER_ID = "USER{0:D3}" -f $i
    $MEMBER_IDS += $USER_ID
    $LOCATION = if ($i % 2 -eq 0) { "Chengdu" } else { "Deyang" }
    $body = "{{`"userID`":`"$USER_ID`",`"name`":`"Li$i`",`"systemRole`":`"Member`",`"officeLocation`":`"$LOCATION`",`"status`":`"Active`",`"title`":`"Engineer`",`"password`":`"123456`"}}"
    $null = curl -s -X POST "$API_BASE/api/users" -H "Content-Type: application/json" -d $body
    Write-Host "  Created member $USER_ID" -ForegroundColor Green
}

# 2. Generate Projects
Write-Host ""
Write-Host "=== Generate Projects (50) ===" -ForegroundColor Yellow

$PROJECT_CATEGORIES = @("Market", "Execution", "Nuclear", "Research", "Renovation", "Other")
$PROJECT_COUNTS = @(10, 12, 8, 8, 7, 5)

$PROJECT_IDS = @()
for ($idx = 0; $idx -lt $PROJECT_CATEGORIES.Length; $idx++) {
    $CATEGORY = $PROJECT_CATEGORIES[$idx]
    $COUNT = $PROJECT_COUNTS[$idx]

    for ($i = 1; $i -le $COUNT; $i++) {
        $PROJECT_ID = "P-${CATEGORY}-{0:D3}" -f $i
        $PROJECT_IDS += $PROJECT_ID

        if ($CATEGORY -eq "Market") {
            $CAPACITY = @("300MW", "500MW", "800MW", "1000MW")[$i % 4]
            $MODEL = @("Francis", "Kaplan", "Pelton")[$i % 3]
            $IS_WON = if ($i % 2 -eq 0) { "true" } else { "false" }
            $IS_FOREIGN = if ($i % 3 -eq 0) { "true" } else { "false" }
            $body = "{{`"name`":`"${CATEGORY}Project$i`",`"category`":`"$CATEGORY`",`"workNo`":`"${CATEGORY}-2025-{0:D3}`",`"capacity`":`"$CAPACITY`",`"model`":`"$MODEL`",`"startDate`":`"2025-01-01`",`"endDate`":`"2025-12-31`",`"isWon`":$IS_WON,`"isForeign`":$IS_FOREIGN}}"
        } else {
            $body = "{{`"name`":`"${CATEGORY}Project$i`",`"category`":`"$CATEGORY`",`"workNo`":`"${CATEGORY}-2025-{0:D3}`",`"startDate`":`"2025-01-01`",`"endDate`":`"2025-12-31`"}}"
        }
        $body = $body -f $i
        $null = curl -s -X POST "$API_BASE/api/projects" -H "Content-Type: application/json" -d $body
        Write-Host "  Created project $PROJECT_ID" -ForegroundColor Green
    }
}

# 3. Generate Tasks
Write-Host ""
Write-Host "=== Generate Tasks (135) ===" -ForegroundColor Yellow

$TASK_CLASSES = @("TC001", "TC002", "TC003", "TC004", "TC005", "TC006", "TC007", "TC008", "TC009", "TC010")
$TASK_COUNTS = @(15, 20, 15, 15, 15, 15, 10, 10, 10, 10)
$TASK_STATUSES = @("NotStarted", "Drafting", "InProgress", "Revising", "Completed")
$SUB_CATS = @("Cat1", "Cat2", "Cat3", "Cat4")

$ALL_USERS = $LEADER_IDS + $MEMBER_IDS

for ($idx = 0; $idx -lt $TASK_CLASSES.Length; $idx++) {
    $TASK_CLASS = $TASK_CLASSES[$idx]
    $COUNT = $TASK_COUNTS[$idx]

    for ($i = 1; $i -le $COUNT; $i++) {
        $TASK_ID = "T-{0:D8}" -f (Get-Random -Minimum 1 -Maximum 99999999)

        $ASSIGNEE_ID = $ALL_USERS[(Get-Random -Minimum 0 -Maximum $ALL_USERS.Length)]
        $CHECKER_ID = $LEADER_IDS[(Get-Random -Minimum 0 -Maximum $LEADER_IDS.Length)]
        $CHIEF_DESIGNER_ID = $LEADER_IDS[(Get-Random -Minimum 0 -Maximum $LEADER_IDS.Length)]
        $APPROVER_ID = $LEADER_IDS[(Get-Random -Minimum 0 -Maximum $LEADER_IDS.Length)]
        $CREATED_BY = $LEADER_IDS[(Get-Random -Minimum 0 -Maximum $LEADER_IDS.Length)]

        $SUB_CATEGORY = $SUB_CATS[(Get-Random -Minimum 0 -Maximum $SUB_CATS.Length)]
        $STATUS = $TASK_STATUSES[(Get-Random -Minimum 0 -Maximum $TASK_STATUSES.Length)]
        $WORKLOAD = Get-Random -Minimum 10 -Maximum 90
        $DIFFICULTY = "{0}.{1}" -f (Get-Random -Minimum 5 -Maximum 25), (Get-Random -Minimum 0 -Maximum 10)
        $RANDOM_PROJECT_ID = $PROJECT_IDS[(Get-Random -Minimum 0 -Maximum $PROJECT_IDS.Length)]

        $MONTH = Get-Random -Minimum 1 -Maximum 13
        $DAY = Get-Random -Minimum 1 -Maximum 28
        $START_DATE = "2025-{0:D2}-{1:D2}" -f $MONTH, $DAY
        $DUE_DAYS = Get-Random -Minimum 1 -Maximum 30

        $body = "{{`"taskName`":`"Task${TASK_CLASS}_$i`",`"taskClassID`":`"$TASK_CLASS`",`"category`":`"$SUB_CATEGORY`",`"projectID`":`"$RANDOM_PROJECT_ID`",`"assigneeID`":`"$ASSIGNEE_ID`",`"assigneeName`":`"$ASSIGNEE_ID`",`"checkerID`":`"$CHECKER_ID`",`"chiefDesignerID`":`"$CHIEF_DESIGNER_ID`",`"approverID`":`"$APPROVER_ID`",`"startDate`":`"$START_DATE`",`"dueDate`":`"2025-12-31`",`"status`":`"$STATUS`",`"workload`":$WORKLOAD,`"difficulty`":$DIFFICULTY,`"createdBy`":`"$CREATED_BY`"}}"

        if ($TASK_CLASS -eq "TC009") {
            $LOC = @("Beijing", "Shanghai", "Chengdu", "Wuhan")[(Get-Random -Minimum 0 -Maximum 4)]
            $DUR = Get-Random -Minimum 1 -Maximum 11
            $body = "{{`"taskName`":`"Travel${TASK_CLASS}_$i`",`"taskClassID`":`"$TASK_CLASS`",`"category`":`"$SUB_CATEGORY`",`"assigneeID`":`"$ASSIGNEE_ID`",`"assigneeName`":`"$ASSIGNEE_ID`",`"checkerID`":`"$CHECKER_ID`",`"chiefDesignerID`":`"$CHIEF_DESIGNER_ID`",`"approverID`":`"$APPROVER_ID`",`"startDate`":`"$START_DATE`",`"dueDate`":`"2025-12-31`",`"status`":`"$STATUS`",`"workload`":$WORKLOAD,`"difficulty`":$DIFFICULTY,`"travelLocation`":`"$LOC`",`"travelDuration`":$DUR,`"travelLabel`":`"MarketTravel`",`"createdBy`":`"$CREATED_BY`"}}"
        } elseif ($TASK_CLASS -eq "TC007") {
            $DUR = Get-Random -Minimum 1 -Maximum 9
            $body = "{{`"taskName`":`"Meeting${TASK_CLASS}_$i`",`"taskClassID`":`"$TASK_CLASS`",`"category`":`"$SUB_CATEGORY`",`"assigneeID`":`"$ASSIGNEE_ID`",`"assigneeName`":`"$ASSIGNEE_ID`",`"checkerID`":`"$CHECKER_ID`",`"chiefDesignerID`":`"$CHIEF_DESIGNER_ID`",`"approverID`":`"$APPROVER_ID`",`"startDate`":`"$START_DATE`",`"dueDate`":`"2025-12-31`",`"status`":`"$STATUS`",`"workload`":$WORKLOAD,`"difficulty`":$DIFFICULTY,`"meetingDuration`":$DUR,`"createdBy`":`"$CREATED_BY`"}}"
        }

        $null = curl -s -X POST "$API_BASE/api/tasks" -H "Content-Type: application/json" -d $body
        Write-Host "  Created task $TASK_ID" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test data generation completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API: $API_BASE" -ForegroundColor White
Write-Host "Swagger: $API_BASE/swagger" -ForegroundColor White
