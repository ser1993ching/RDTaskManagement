using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 日志管理控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class LogsController : ControllerBase
{
    private readonly ILogService _logService;
    private readonly ILogger<LogsController> _logger;

    public LogsController(ILogService logService, ILogger<LogsController> logger)
    {
        _logService = logService;
        _logger = logger;
    }

    /// <summary>
    /// 获取日志列表（分页）
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? userId,
        [FromQuery] string? path,
        [FromQuery] bool? isSuccess,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var (logs, total) = await _logService.GetLogsAsync(
            startDate, endDate, userId, path, isSuccess, page, pageSize);

        return Ok(new PaginatedResponse<ApiLogDto>
        {
            Data = logs.Select(ApiLogDto.FromEntity).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize,
            Pages = (int)Math.Ceiling(total / (double)pageSize)
        });
    }

    /// <summary>
    /// 获取单条日志详情
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetLog(long id)
    {
        var log = await _logService.GetLogByIdAsync(id);
        if (log == null)
            return NotFound(new { Message = "日志不存在" });

        return Ok(ApiLogDto.FromEntity(log));
    }

    /// <summary>
    /// 获取日志统计信息
    /// </summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        startDate ??= DateTime.Now.AddDays(-7);
        endDate ??= DateTime.Now;

        var (logs, _) = await _logService.GetLogsAsync(startDate, endDate, null, null, null, 1, int.MaxValue);

        var stats = new LogStatisticsDto
        {
            TotalRequests = logs.Count,
            SuccessfulRequests = logs.Count(l => l.IsSuccess),
            FailedRequests = logs.Count(l => !l.IsSuccess),
            AverageResponseTime = logs.Any() ? logs.Average(l => l.ElapsedMilliseconds) : 0,
            MinResponseTime = logs.Any() ? logs.Min(l => l.ElapsedMilliseconds) : 0,
            MaxResponseTime = logs.Any() ? logs.Max(l => l.ElapsedMilliseconds) : 0,
            RequestsByHour = logs
                .GroupBy(l => l.CreatedAt.Hour)
                .Select(g => new LogByHourDto { Hour = g.Key, Count = g.Count() })
                .OrderBy(x => x.Hour)
                .ToList(),
            TopPaths = logs
                .GroupBy(l => l.Path)
                .OrderByDescending(g => g.Count())
                .Take(10)
                .Select(g => new LogByPathDto { Path = g.Key, Count = g.Count() })
                .ToList()
        };

        return Ok(stats);
    }

    /// <summary>
    /// 清理过期日志（30天前）
    /// </summary>
    [HttpDelete("cleanup")]
    public async Task<IActionResult> CleanupLogs([FromQuery] int daysToKeep = 30)
    {
        _logger.LogWarning("管理员手动触发日志清理，保留最近 {Days} 天", daysToKeep);

        var deletedCount = await _logService.CleanupOldLogsAsync(daysToKeep);

        return Ok(new
        {
            Message = $"已清理 {deletedCount} 条过期日志",
            DaysKept = daysToKeep
        });
    }
}
