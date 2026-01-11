namespace TaskManageSystem.Domain.Enums;

/// <summary>
/// 任务状�?
/// </summary>
public enum TaskStatus
{
    [Display(Name = "未开�?)]
    NotStarted = 0,

    [Display(Name = "编制�?)]
    Drafting = 1,

    [Display(Name = "修改�?)]
    Revising = 2,

    [Display(Name = "校核�?)]
    Reviewing = 3,

    [Display(Name = "审查�?)]
    Reviewing2 = 4,

    [Display(Name = "已完�?)]
    Completed = 5
}
