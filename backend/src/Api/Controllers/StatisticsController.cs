using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.Statistics;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 统计控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService _statisticsService;
    private readonly ITaskService _taskService;

    public StatisticsController(IStatisticsService statisticsService, ITaskService taskService)
    {
        _statisticsService = statisticsService;
        _taskService = taskService;
    }

    /// <summary>
    /// 获取个人统计
    /// </summary>
    [HttpGet("personal")]
    public async Task<IActionResult> GetPersonalStats([FromQuery] string userId, [FromQuery] string period = "month")
    {
        var stats = await _statisticsService.GetPersonalStatsAsync(userId, period);
        return Ok(stats);
    }

    /// <summary>
    /// 获取个人任务（按状态分类）
    /// </summary>
    [HttpGet("personal/tasks")]
    public async Task<IActionResult> GetPersonalTasks([FromQuery] string userId, [FromQuery] string period = "month", [FromQuery] string? status = null)
    {
        var tasks = await _statisticsService.GetPersonalTasksByStatusAsync(userId, period, status);
        return Ok(tasks);
    }

    /// <summary>
    /// 获取团队统计
    /// </summary>
    [HttpGet("team")]
    public async Task<IActionResult> GetTeamStats([FromQuery] string period = "month", [FromQuery] string? officeLocation = null)
    {
        var stats = await _statisticsService.GetTeamStatsAsync(period, officeLocation);
        return Ok(stats);
    }

    /// <summary>
    /// 获取工作量分布
    /// </summary>
    [HttpGet("workload")]
    public async Task<IActionResult> GetWorkload([FromQuery] string period = "month")
    {
        var workload = await _statisticsService.GetWorkloadDistributionAsync(period);
        return Ok(workload);
    }

    /// <summary>
    /// 获取月度趋势
    /// </summary>
    [HttpGet("trend/monthly")]
    public async Task<IActionResult> GetMonthlyTrend([FromQuery] string? userId, [FromQuery] int months = 12, [FromQuery] string period = "month")
    {
        var trend = await _statisticsService.GetMonthlyTrendAsync(userId, months, period);
        return Ok(trend);
    }

    /// <summary>
    /// 获取日趋势
    /// </summary>
    [HttpGet("trend/daily")]
    public async Task<IActionResult> GetDailyTrend([FromQuery] string? userId, [FromQuery] int days = 7)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return Ok(new List<object>());
        }
        var trend = await _statisticsService.GetDailyTrendAsync(userId, days);
        return Ok(trend);
    }

    /// <summary>
    /// 获取拖延任务
    /// </summary>
    [HttpGet("delayed")]
    public async Task<IActionResult> GetDelayedTasks([FromQuery] string? userId, [FromQuery] int daysThreshold = 60)
    {
        var tasks = await _statisticsService.GetDelayedTasksAsync(userId, daysThreshold);
        return Ok(tasks);
    }

    /// <summary>
    /// 获取逾期任务
    /// </summary>
    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdueTasks([FromQuery] string? userId)
    {
        var tasks = await _statisticsService.GetOverdueTasksAsync(userId);
        return Ok(tasks);
    }

    /// <summary>
    /// 获取差旅统计
    /// </summary>
    [HttpGet("travel")]
    public async Task<IActionResult> GetTravelStatistics([FromQuery] string? userId, [FromQuery] string period = "month", [FromQuery] string? projectId = null)
    {
        var stats = await _statisticsService.GetTravelStatisticsAsync(userId, period, projectId);
        return Ok(stats);
    }

    /// <summary>
    /// 获取会议统计
    /// </summary>
    [HttpGet("meeting")]
    public async Task<IActionResult> GetMeetingStatistics([FromQuery] string? userId, [FromQuery] string period = "month")
    {
        var stats = await _statisticsService.GetMeetingStatisticsAsync(userId, period);
        return Ok(stats);
    }

    /// <summary>
    /// 获取工作日信息
    /// </summary>
    [HttpGet("workdays")]
    public async Task<IActionResult> GetWorkDays([FromQuery] string period = "month")
    {
        var workDays = await _statisticsService.GetWorkDaysAsync(period);
        return Ok(workDays);
    }
}
