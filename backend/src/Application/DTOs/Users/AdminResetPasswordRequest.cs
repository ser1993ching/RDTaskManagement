namespace TaskManageSystem.Application.DTOs.Users;

/// <summary>
/// 管理员重置用户密码请求
/// </summary>
public class AdminResetPasswordRequest
{
    public string? NewPassword { get; set; }
}
