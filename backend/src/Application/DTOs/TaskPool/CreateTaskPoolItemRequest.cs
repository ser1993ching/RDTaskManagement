namespace TaskManageSystem.Application.DTOs.TaskPool;

/// <summary>
/// 创建任务库项请求
/// </summary>
public class CreateTaskPoolItemRequest
{
    [Required]
    [MaxLength(200)]
    public string TaskName { get; set; } = string.Empty;

    [Required]
    public string TaskClassID { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    public string? ProjectID { get; set; }
    public string? ProjectName { get; set; }
    public string? PersonInChargeID { get; set; }
    public string? PersonInChargeName { get; set; }
    public string? CheckerID { get; set; }
    public string? ChiefDesignerID { get; set; }
    public string? ApproverID { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsForceAssessment { get; set; }
    public string? Remark { get; set; }
}
