using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Application.Interfaces;

/// <summary>
/// 日志服务接口
/// </summary>
public interface ILogService
{
    /// <summary>
    /// 记录API日志
    /// </summary>
    Task LogAsync(ApiLog log);

    /// <summary>
    /// 获取日志列表（分页）
    /// </summary>
    Task<(List<ApiLog> Logs, int Total)> GetLogsAsync(
        DateTime? startDate,
        DateTime? endDate,
        string? userId,
        string? path,
        bool? isSuccess,
        int page = 1,
        int pageSize = 50);

    /// <summary>
    /// 获取单条日志详情
    /// </summary>
    Task<ApiLog?> GetLogByIdAsync(long id);

    /// <summary>
    /// 清理过期日志（30天前）
    /// </summary>
    Task<int> CleanupOldLogsAsync(int daysToKeep = 30);
}

/// <summary>
/// 日志查询参数
/// </summary>
public class LogQueryParams
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? UserId { get; set; }
    public string? Path { get; set; }
    public bool? IsSuccess { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
