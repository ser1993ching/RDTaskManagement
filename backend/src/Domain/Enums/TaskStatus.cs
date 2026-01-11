namespace R&DTaskSystem.Domain.Enums;

/// <summary>
/// 任务状态
/// </summary>
public enum TaskStatus
{
    [Display(Name = "未开始")]
    NotStarted = 0,

    [Display(Name = "编制中")]
    Drafting = 1,

    [Display(Name = "修改中")]
    Revising = 2,

    [Display(Name = "校核中")]
    Reviewing = 3,

    [Display(Name = "审查中")]
    Reviewing2 = 4,

    [Display(Name = "已完成")]
    Completed = 5
}
