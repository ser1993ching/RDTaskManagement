namespace TaskManageSystem.Api.Models;

/// <summary>
/// API 响应
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public ApiError? Error { get; set; }
}

/// <summary>
/// API 错误
/// </summary>
public class ApiError
{
    public string? Code { get; set; }
    public string? Message { get; set; }
}
