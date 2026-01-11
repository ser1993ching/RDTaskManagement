namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 更新角色状态请�?
/// </summary>
public class UpdateRoleStatusRequest
{
    [Required]
    public string Role { get; set; } = string.Empty;  // assignee, checker, chiefDesigner, approver

    [Required]
    public string Status { get; set; } = string.Empty;
}
