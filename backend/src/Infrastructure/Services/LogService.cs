using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Infrastructure.Data;

namespace TaskManageSystem.Infrastructure.Services;

/// <summary>
/// 日志服务实现
/// </summary>
public class LogService : ILogService
{
    private readonly IDbContextFactory<LogDbContext> _contextFactory;
    private readonly ILogger<LogService> _logger;

    public LogService(IDbContextFactory<LogDbContext> contextFactory, ILogger<LogService> logger)
    {
        _contextFactory = contextFactory;
        _logger = logger;
    }

    public async Task LogAsync(ApiLog log)
    {
        try
        {
            using var context = await _contextFactory.CreateDbContextAsync();
            context.ApiLogs.Add(log);
            await context.SaveChangesAsync();
            _logger.LogDebug("API日志已保存: {RequestId}", log.RequestId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "保存API日志失败: {RequestId}", log.RequestId);
        }
    }

    public async Task<(List<ApiLog> Logs, int Total)> GetLogsAsync(
        DateTime? startDate,
        DateTime? endDate,
        string? userId,
        string? path,
        bool? isSuccess,
        int page = 1,
        int pageSize = 50)
    {
        using var context = await _contextFactory.CreateDbContextAsync();
        var query = context.ApiLogs.AsQueryable();

        // 日期范围筛选
        if (startDate.HasValue)
        {
            query = query.Where(l => l.CreatedAt >= startDate.Value);
        }
        if (endDate.HasValue)
        {
            query = query.Where(l => l.CreatedAt <= endDate.Value);
        }

        // 用户筛选
        if (!string.IsNullOrWhiteSpace(userId))
        {
            query = query.Where(l => l.UserId != null && l.UserId.Contains(userId));
        }

        // 路径筛选
        if (!string.IsNullOrWhiteSpace(path))
        {
            query = query.Where(l => l.Path.Contains(path));
        }

        // 成功/失败筛选
        if (isSuccess.HasValue)
        {
            query = query.Where(l => l.IsSuccess == isSuccess.Value);
        }

        // 排序（最新在前）
        query = query.OrderByDescending(l => l.CreatedAt);

        var total = await query.CountAsync();
        var logs = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (logs, total);
    }

    public async Task<ApiLog?> GetLogByIdAsync(long id)
    {
        using var context = await _contextFactory.CreateDbContextAsync();
        return await context.ApiLogs.FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<int> CleanupOldLogsAsync(int daysToKeep = 30)
    {
        using var context = await _contextFactory.CreateDbContextAsync();
        var cutoffDate = DateTime.Now.AddDays(-daysToKeep);
        var oldLogs = await context.ApiLogs
            .Where(l => l.CreatedAt < cutoffDate)
            .ToListAsync();

        if (oldLogs.Any())
        {
            context.ApiLogs.RemoveRange(oldLogs);
            var deletedCount = await context.SaveChangesAsync();
            _logger.LogInformation("已清理 {Count} 条 {Days} 天前的日志", deletedCount, daysToKeep);
            return deletedCount;
        }

        return 0;
    }
}
