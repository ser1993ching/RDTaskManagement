using Microsoft.AspNetCore.Mvc;
using R&DTaskSystem.Application.DTOs.Common;
using R&DTaskSystem.Application.DTOs.Statistics;
using R&DTaskSystem.Application.DTOs.TaskPool;
using R&DTaskSystem.Application.Interfaces;

namespace R&DTaskSystem.Api.Controllers;

/// <summary>
/// 统计控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService _statisticsService;

    public StatisticsController(IStatisticsService statisticsService)
    {
        _statisticsService = statisticsService;
    }

    /// <summary>
    /// 获取个人统计
    /// </summary>
    [HttpGet("personal")]
    public async Task<ActionResult<ApiResponse<PersonalStats>>> GetPersonalStats([FromQuery] string userId, [FromQuery] string period = "month")
    {
        var stats = await _statisticsService.GetPersonalStatsAsync(userId, period);
        return Ok(new ApiResponse<PersonalStats> { Success = true, Data = stats });
    }

    /// <summary>
    /// 获取个人任务（按状态分离）
    /// </summary>
    [HttpGet("personal/tasks")]
    public async Task<ActionResult<ApiResponse<PersonalTasksResponse>>> GetPersonalTasks([FromQuery] string userId, [FromQuery] string? period, [FromQuery] string? status)
    {
        var tasks = await _statisticsService.GetPersonalTasksByStatusAsync(userId, period ?? "month", status);
        return Ok(new ApiResponse<PersonalTasksResponse> { Success = true, Data = tasks });
    }

    /// <summary>
    /// 获取差旅统计
    /// </summary>
    [HttpGet("travel")]
    public async Task<ActionResult<ApiResponse<TravelStatisticsResponse>>> GetTravelStats([FromQuery] string? userId, [FromQuery] string period = "month", [FromQuery] string? projectId = null)
    {
        var stats = await _statisticsService.GetTravelStatisticsAsync(userId, period, projectId);
        return Ok(new ApiResponse<TravelStatisticsResponse> { Success = true, Data = stats });
    }

    /// <summary>
    /// 获取会议统计
    /// </summary>
    [HttpGet("meetings")]
    public async Task<ActionResult<ApiResponse<MeetingStatisticsResponse>>> GetMeetingStats([FromQuery] string? userId, [FromQuery] string period = "month")
    {
        var stats = await _statisticsService.GetMeetingStatisticsAsync(userId, period);
        return Ok(new ApiResponse<MeetingStatisticsResponse> { Success = true, Data = stats });
    }

    /// <summary>
    /// 获取团队统计
    /// </summary>
    [HttpGet("team")]
    public async Task<ActionResult<ApiResponse<TeamStats>>> GetTeamStats([FromQuery] string period = "month", [FromQuery] string? officeLocation = null)
    {
        var stats = await _statisticsService.GetTeamStatsAsync(period, officeLocation);
        return Ok(new ApiResponse<TeamStats> { Success = true, Data = stats });
    }

    /// <summary>
    /// 获取工作量分布
    /// </summary>
    [HttpGet("workload")]
    public async Task<ActionResult<ApiResponse<WorkloadDistribution>>> GetWorkloadDistribution([FromQuery] string period = "month")
    {
        var stats = await _statisticsService.GetWorkloadDistributionAsync(period);
        return Ok(new ApiResponse<WorkloadDistribution> { Success = true, Data = stats });
    }

    /// <summary>
    /// 获取月度趋势
    /// </summary>
    [HttpGet("trend/monthly")]
    public async Task<ActionResult<ApiResponse<List<MonthlyTrendItem>>>> GetMonthlyTrend([FromQuery] string? userId, [FromQuery] int months = 6, [FromQuery] string period = "month")
    {
        var trend = await _statisticsService.GetMonthlyTrendAsync(userId, months, period);
        return Ok(new ApiResponse<List<MonthlyTrendItem>> { Success = true, Data = trend });
    }

    /// <summary>
    /// 获取每日趋势
    /// </summary>
    [HttpGet("trend/daily")]
    public async Task<ActionResult<ApiResponse<List<DailyTrendItem>>>> GetDailyTrend([FromQuery] string userId, [FromQuery] int days = 7)
    {
        var trend = await _statisticsService.GetDailyTrendAsync(userId, days);
        return Ok(new ApiResponse<List<DailyTrendItem>> { Success = true, Data = trend });
    }

    /// <summary>
    /// 获取工作日信息
    /// </summary>
    [HttpGet("workdays")]
    public async Task<ActionResult<ApiResponse<WorkDayInfo>>> GetWorkDays([FromQuery] string period)
    {
        var info = await _statisticsService.GetWorkDaysAsync(period);
        return Ok(new ApiResponse<WorkDayInfo> { Success = true, Data = info });
    }

    /// <summary>
    /// 导出统计数据
    /// </summary>
    [HttpPost("export")]
    public async Task<IActionResult> ExportStatistics([FromBody] ExportStatisticsRequest request)
    {
        var data = await _statisticsService.ExportStatisticsAsync(request.UserId, request.Period);
        return File(data, "text/csv", $"statistics_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    /// <summary>
    /// 获取拖延任务清单
    /// </summary>
    [HttpGet("delayed-tasks")]
    public async Task<ActionResult<ApiResponse<DelayedTasksResponse>>> GetDelayedTasks([FromQuery] string? userId, [FromQuery] int daysThreshold = 60)
    {
        var tasks = await _statisticsService.GetDelayedTasksAsync(userId, daysThreshold);
        return Ok(new ApiResponse<DelayedTasksResponse> { Success = true, Data = tasks });
    }

    /// <summary>
    /// 获取逾期任务
    /// </summary>
    [HttpGet("overdue-tasks")]
    public async Task<ActionResult<ApiResponse<DelayedTasksResponse>>> GetOverdueTasks([FromQuery] string? userId)
    {
        var tasks = await _statisticsService.GetOverdueTasksAsync(userId);
        return Ok(new ApiResponse<DelayedTasksResponse> { Success = true, Data = tasks });
    }
}

public class ExportStatisticsRequest
{
    public string UserId { get; set; } = string.Empty;
    public string Period { get; set; } = "month";
}
