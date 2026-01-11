namespace R&DTaskSystem.Application.DTOs.Settings;

/// <summary>
/// 认证请求
/// </summary>
public class LoginRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// 认证响应
/// </summary>
public class LoginResponse
{
    public bool Success { get; set; }
    public UserDto? User { get; set; }
    public string? Token { get; set; }
    public string? Message { get; set; }
}

/// <summary>
/// 修改密码请求
/// </summary>
public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// 重置密码请求（管理员）
/// </summary>
public class ResetPasswordRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    public string? NewPassword { get; set; }
}
