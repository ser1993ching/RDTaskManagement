namespace TaskManageSystem.Domain.Enums;

/// <summary>
/// 项目类型
/// </summary>
public enum ProjectCategory
{
    [Display(Name = "市场配合项目")]
    Market = 0,

    [Display(Name = "常规项目")]
    Execution = 1,

    [Display(Name = "核电项目")]
    Nuclear = 2,

    [Display(Name = "科研项目")]
    Research = 3,

    [Display(Name = "改造项�?)]
    Renovation = 4,

    [Display(Name = "其他项目")]
    Other = 5
}
