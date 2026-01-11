using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Application.DTOs.Users;

/// <summary>
/// 创建用户请求
/// </summary>
public class CreateUserRequest
{
    [Required]
    [MaxLength(50)]
    public string UserID { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string SystemRole { get; set; } = string.Empty;

    [Required]
    public string OfficeLocation { get; set; } = string.Empty;

    public string? Title { get; set; }
    public DateTime? JoinDate { get; set; }

    [Required]
    public string Status { get; set; } = string.Empty;

    public string? Education { get; set; }
    public string? School { get; set; }
    public string? Password { get; set; }
    public string? Remark { get; set; }
}
