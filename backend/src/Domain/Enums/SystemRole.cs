namespace R&DTaskSystem.Domain.Enums;

/// <summary>
/// 系统角色
/// </summary>
public enum SystemRole
{
    [Display(Name = "组员")]
    Member = 0,

    [Display(Name = "班组长")]
    Leader = 1,

    [Display(Name = "管理员")]
    Admin = 2
}
