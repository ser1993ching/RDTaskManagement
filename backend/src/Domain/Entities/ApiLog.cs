using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManageSystem.Domain.Entities;

/// <summary>
/// API操作日志实体
/// </summary>
public class ApiLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    /// <summary>
    /// 请求唯一标识
    /// </summary>
    [Required]
    [MaxLength(64)]
    public string RequestId { get; set; } = string.Empty;

    /// <summary>
    /// 用户ID
    /// </summary>
    [MaxLength(64)]
    public string? UserId { get; set; }

    /// <summary>
    /// HTTP方法
    /// </summary>
    [Required]
    [MaxLength(16)]
    public string Method { get; set; } = string.Empty;

    /// <summary>
    /// 请求路径
    /// </summary>
    [Required]
    [MaxLength(512)]
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// 查询字符串
    /// </summary>
    [MaxLength(1024)]
    public string? QueryString { get; set; }

    /// <summary>
    /// 请求体（截断）
    /// </summary>
    [MaxLength(2000)]
    public string? RequestBody { get; set; }

    /// <summary>
    /// 响应状态码
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// 状态描述
    /// </summary>
    [MaxLength(32)]
    public string? StatusInfo { get; set; }

    /// <summary>
    /// 响应结果（成功/失败）
    /// </summary>
    [Required]
    public bool IsSuccess { get; set; }

    /// <summary>
    /// 耗时（毫秒）
    /// </summary>
    public long ElapsedMilliseconds { get; set; }

    /// <summary>
    /// 客户端IP
    /// </summary>
    [MaxLength(64)]
    public string? ClientIp { get; set; }

    /// <summary>
    /// User-Agent
    /// </summary>
    [MaxLength(512)]
    public string? UserAgent { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}

/// <summary>
/// 日志级别枚举
/// </summary>
public enum LogLevel
{
    Debug = 0,
    Information = 1,
    Warning = 2,
    Error = 3,
    Critical = 4
}
