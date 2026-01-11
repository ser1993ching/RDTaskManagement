namespace TaskManageSystem.Domain.Enums;

/// <summary>
/// 任务类别代码
/// </summary>
public enum TaskClassCode
{
    [Display(Name = "MARKET")]
    Market = 0,

    [Display(Name = "EXECUTION")]
    Execution = 1,

    [Display(Name = "NUCLEAR")]
    Nuclear = 2,

    [Display(Name = "PRODUCT_DEV")]
    ProductDev = 3,

    [Display(Name = "RESEARCH")]
    Research = 4,

    [Display(Name = "RENOVATION")]
    Renovation = 5,

    [Display(Name = "MEETING_TRAINING")]
    MeetingTraining = 6,

    [Display(Name = "ADMIN_PARTY")]
    AdminParty = 7,

    [Display(Name = "TRAVEL")]
    Travel = 8,

    [Display(Name = "OTHER")]
    Other = 9
}
