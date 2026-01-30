using System.ComponentModel.DataAnnotations;
using TaskManageSystem.Application.DTOs.Users;

namespace TaskManageSystem.Application.DTOs.Settings;

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
/// 认证响应（ApiResponse包装后返回）
/// </summary>
public class LoginResponse
{
    public UserDto? User { get; set; }
    public string? Token { get; set; }
}

/// <summary>
/// 修改密码请求
/// </summary>
public class ChangePasswordRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;

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

/// <summary>
/// Token刷新响应
/// </summary>
public class TokenResponse
{
    public string? Token { get; set; }
}

/// <summary>
/// 刷新Token请求
/// </summary>
public class RefreshTokenRequest
{
    public string? RefreshToken { get; set; }
}

/// <summary>
/// 系统初始化请求
/// </summary>
public class SetupRequest
{
    [Required]
    public string AdminUserId { get; set; } = string.Empty;

    [Required]
    public string AdminName { get; set; } = string.Empty;

    [Required]
    public string AdminPassword { get; set; } = string.Empty;
}
