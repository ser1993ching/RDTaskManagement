using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Domain.Enums;

/// <summary>
/// 角色状态
/// </summary>
public enum RoleStatus
{
    [Display(Name = "未开始")]
    NotStarted = 0,

    [Display(Name = "进行中")]
    InProgress = 1,

    [Display(Name = "修改中")]
    Revising = 2,

    [Display(Name = "已驳回")]
    Rejected = 3,

    [Display(Name = "已完成")]
    Completed = 4
}
