namespace TaskManageSystem.Application.DTOs.Common;

/// <summary>
/// 统一API响应
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public ApiError? Error { get; set; }
}

public class ApiError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
