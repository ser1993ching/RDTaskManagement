namespace R&DTaskSystem.Domain.Enums;

/// <summary>
/// 角色状态（负责人、校核人、主任设计、审查人共用）
/// </summary>
public enum RoleStatus
{
    [Display(Name = "未开始")]
    NotStarted = 0,

    [Display(Name = "进行中")]
    InProgress = 1,

    [Display(Name = "修改中")]
    Revising = 2,

    [Display(Name = "驳回中")]
    Rejected = 3,

    [Display(Name = "已完成")]
    Completed = 4
}
