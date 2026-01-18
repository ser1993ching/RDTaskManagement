using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Application.DTOs.Common;

/// <summary>
/// API日志响应DTO
/// </summary>
public class ApiLogDto
{
    public long Id { get; set; }
    public string RequestId { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string Method { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public string? QueryString { get; set; }
    public string? RequestBody { get; set; }
    public int StatusCode { get; set; }
    public string? StatusInfo { get; set; }
    public bool IsSuccess { get; set; }
    public long ElapsedMilliseconds { get; set; }
    public string? ClientIp { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 从实体转换
    /// </summary>
    public static ApiLogDto FromEntity(ApiLog entity)
    {
        return new ApiLogDto
        {
            Id = entity.Id,
            RequestId = entity.RequestId,
            UserId = entity.UserId,
            Method = entity.Method,
            Path = entity.Path,
            QueryString = entity.QueryString,
            RequestBody = entity.RequestBody,
            StatusCode = entity.StatusCode,
            StatusInfo = entity.StatusInfo,
            IsSuccess = entity.IsSuccess,
            ElapsedMilliseconds = entity.ElapsedMilliseconds,
            ClientIp = entity.ClientIp,
            UserAgent = entity.UserAgent,
            CreatedAt = entity.CreatedAt
        };
    }
}

/// <summary>
/// 日志统计DTO
/// </summary>
public class LogStatisticsDto
{
    public int TotalRequests { get; set; }
    public int SuccessfulRequests { get; set; }
    public int FailedRequests { get; set; }
    public double AverageResponseTime { get; set; }
    public long MinResponseTime { get; set; }
    public long MaxResponseTime { get; set; }
    public List<LogByHourDto> RequestsByHour { get; set; } = new();
    public List<LogByPathDto> TopPaths { get; set; } = new();
}

/// <summary>
/// 按小时统计
/// </summary>
public class LogByHourDto
{
    public int Hour { get; set; }
    public int Count { get; set; }
}

/// <summary>
/// 按路径统计
/// </summary>
public class LogByPathDto
{
    public string Path { get; set; } = string.Empty;
    public int Count { get; set; }
}
