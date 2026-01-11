namespace R&DTaskSystem.Application.DTOs.TaskPool;

/// <summary>
/// 任务库项DTO
/// </summary>
public class TaskPoolItemDto
{
    public string Id { get; set; } = string.Empty;
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
}
