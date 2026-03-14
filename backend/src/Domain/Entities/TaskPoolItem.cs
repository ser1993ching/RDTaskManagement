namespace TaskManageSystem.Domain.Entities;

/// <summary>
/// 任务库实�?
/// </summary>
public class TaskPoolItem : BaseEntity<string>
{
    public string Id { get; set; } = string.Empty;    // 计划任务ID (PK)
    public string TaskName { get; set; } = string.Empty;
    public string TaskClassID { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ProjectID { get; set; }
    public string? ProjectName { get; set; }
    public string? PersonInChargeID { get; set; }
    public string? PersonInChargeName { get; set; }
    public string? CheckerID { get; set; }
    public string? CheckerName { get; set; }
    public string? ChiefDesignerID { get; set; }
    public string? ChiefDesignerName { get; set; }
    public string? ApproverID { get; set; }
    public string? ApproverName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? CreatedByName { get; set; }
    public DateTime CreatedDate { get; set; }
    public bool IsForceAssessment { get; set; }
    public string? Remark { get; set; }
    public string? DongfangTaskType { get; set; }  // 东方任务类型

    // 导航属�?
    public virtual User? PersonInCharge { get; set; }
    public virtual User? Creator { get; set; }
    public virtual Project? Project { get; set; }
    public virtual TaskClass? TaskClass { get; set; }
}
