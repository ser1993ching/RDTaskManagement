namespace TaskManageSystem.Domain.Enums;

/// <summary>
/// 系统角色
/// </summary>
public enum SystemRole
{
    [Display(Name = "组员")]
    Member = 0,

    [Display(Name = "班组�?)]
    Leader = 1,

    [Display(Name = "管理�?)]
    Admin = 2
}
