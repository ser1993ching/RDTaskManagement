using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 创建任务请求
/// </summary>
public class CreateTaskRequest
{
    [Required]
    [MaxLength(200)]
    public string TaskName { get; set; } = string.Empty;

    [Required]
    public string TaskClassID { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    public string? ProjectID { get; set; }
    public string? AssigneeID { get; set; }
    public string? AssigneeName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    [Range(0.5, 3.0)]
    public decimal? Difficulty { get; set; }
    public string? Remark { get; set; }
    public bool IsForceAssessment { get; set; }

    // 角色分配
    public string? CheckerID { get; set; }
    public string? ChiefDesignerID { get; set; }
    public string? ApproverID { get; set; }

    // 差旅任务
    public string? TravelLocation { get; set; }
    public decimal? TravelDuration { get; set; }
    public string? TravelLabel { get; set; }

    // 会议任务
    public decimal? MeetingDuration { get; set; }
    public List<string>? Participants { get; set; }

    // 市场任务
    public string? CapacityLevel { get; set; }
}
