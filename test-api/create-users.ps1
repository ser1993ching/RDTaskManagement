$baseUrl = "http://localhost:5000"
$token = "Bearer mock-jwt-token"
$headers = @{"Authorization" = $token; "Content-Type" = "application/json"}

$users = @(
    @{userId="1004889"; name="胡德剑"; systemRole="Member"; officeLocation="成都"; title="正高级主任工程师"; education="本科"; status="Active"; password="123456"},
    @{userId="1005184"; name="官永胜"; systemRole="Member"; officeLocation="成都"; title="主任工程师"; status="Active"; password="123456"},
    @{userId="1006279"; name="李朝科"; systemRole="Member"; officeLocation="成都"; title="主任工程师"; status="Active"; password="123456"},
    @{userId="1007204"; name="王建立"; systemRole="Member"; officeLocation="成都"; title="副主任工程师"; status="Active"; password="123456"},
    @{userId="1007241"; name="张玮"; systemRole="Member"; officeLocation="德阳"; title="高级工程师"; status="Active"; password="123456"},
    @{userId="1007465"; name="王黔"; systemRole="Member"; officeLocation="德阳"; title="副主任工程师"; status="Active"; password="123456"},
    @{userId="1007690"; name="金媛媛"; systemRole="Member"; officeLocation="成都"; title="副主任工程师"; status="Active"; password="123456"},
    @{userId="1008072"; name="卢永尧"; systemRole="Member"; officeLocation="成都"; title="副主任工程师"; status="Active"; password="123456"},
    @{userId="1008344"; name="陈增芬"; systemRole="Member"; officeLocation="成都"; title="高级工程师"; status="Active"; password="123456"},
    @{userId="1008513"; name="孙青"; systemRole="Member"; officeLocation="德阳"; title="高级工程师"; status="Active"; password="123456"},
    @{userId="3001226"; name="李又超"; systemRole="Leader"; officeLocation="成都"; title="副主任工程师"; status="Active"; password="123456"},
    @{userId="3002681"; name="杨迪"; systemRole="Member"; officeLocation="德阳"; title="高级工程师"; status="Active"; password="123456"},
    @{userId="3002684"; name="古曦"; systemRole="Leader"; officeLocation="德阳"; title="高级工程师"; status="Active"; password="123456"},
    @{userId="3002865"; name="钟德富"; systemRole="Leader"; officeLocation="德阳"; title="高级工程师"; status="Active"; password="123456"},
    @{userId="3003407"; name="廖亨友"; systemRole="Member"; officeLocation="成都"; title="高级工程师"; status="Active"; password="123456"},
    @{userId="3004412"; name="蒋群雄"; systemRole="Member"; officeLocation="德阳"; title="高级工程师"; status="Active"; password="123456"},
    @{userId="3005901"; name="王雅雯"; systemRole="Member"; officeLocation="成都"; title="工程师"; status="Active"; password="123456"},
    @{userId="3005905"; name="曹驰健"; systemRole="Member"; officeLocation="德阳"; title="工程师"; status="Active"; password="123456"},
    @{userId="3005922"; name="王鸿"; systemRole="Leader"; officeLocation="成都"; title="工程师"; status="Active"; password="123456"},
    @{userId="3005925"; name="杨巍"; systemRole="Leader"; officeLocation="成都"; title="工程师"; status="Active"; password="123456"},
    @{userId="3006612"; name="黄鑫"; systemRole="Member"; officeLocation="德阳"; title="工程师"; status="Active"; password="123456"},
    @{userId="3007213"; name="王可欣"; systemRole="Member"; officeLocation="德阳"; title="工程师"; status="Active"; password="123456"},
    @{userId="3007227"; name="苏文博"; systemRole="Member"; officeLocation="成都"; title="工程师"; status="Active"; password="123456"},
    @{userId="3008172"; name="樊嘉豪"; systemRole="Member"; officeLocation="成都"; title="工程师"; status="Active"; password="123456"},
    @{userId="3008231"; name="李典"; systemRole="Member"; officeLocation="成都"; title="工程师"; status="Active"; password="123456"},
    @{userId="3009101"; name="刘林涵"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3010363"; name="刘咏芳"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3010758"; name="魏宇航"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3010862"; name="贺向东"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3012527"; name="杨飞越"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3012524"; name="徐青青"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3012478"; name="牟星宇"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3012451"; name="郑典涛"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3012535"; name="盛晋银"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3014242"; name="罗欢"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3014388"; name="郑淇文"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3014531"; name="杨攀"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3014253"; name="黄泽奇"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"},
    @{userId="3014229"; name="曾一涛"; systemRole="Member"; officeLocation="成都"; title="助理工程师"; status="Active"; password="123456"}
)

Write-Host "=== Creating Users ===" -ForegroundColor Green
$success = 0
$failed = 0

foreach ($user in $users) {
    try {
        $json = $user | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$baseUrl/api/users" -Method Post -Headers $headers -Body $json
        Write-Host "[$($user.userId)] $($user.name) - OK" -ForegroundColor Cyan
        $success++
    } catch {
        Write-Host "[$($user.userId)] $($user.name) - FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Green
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

Write-Host ""
Write-Host "=== Getting User List ===" -ForegroundColor Green
$usersList = Invoke-RestMethod -Uri "$baseUrl/api/users" -Method Get -Headers $headers
Write-Host "Total users: $($usersList.data.data.Count)" -ForegroundColor Yellow
