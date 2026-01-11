namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 任务DTO
/// </summary>
public class TaskDto
{
    public string TaskID { get; set; } = string.Empty;
    public string TaskName { get; set; } = string.Empty;
    public string TaskClassID { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ProjectID { get; set; }
    public string? AssigneeID { get; set; }
    public string? AssigneeName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? Workload { get; set; }
    public decimal? Difficulty { get; set; }
    public string? Remark { get; set; }
    public string CreatedDate { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;

    // 差旅任务字段
    public string? TravelLocation { get; set; }
    public decimal? TravelDuration { get; set; }
    public string? TravelLabel { get; set; }

    // 会议任务字段
    public decimal? MeetingDuration { get; set; }
    public List<string>? Participants { get; set; }
    public List<string>? ParticipantNames { get; set; }

    // 市场任务字段
    public string? CapacityLevel { get; set; }

    // 角色字段
    public string? CheckerID { get; set; }
    public string? CheckerName { get; set; }
    public decimal? CheckerWorkload { get; set; }
    public string? CheckerStatus { get; set; }

    public string? ChiefDesignerID { get; set; }
    public string? ChiefDesignerName { get; set; }
    public decimal? ChiefDesignerWorkload { get; set; }
    public string? ChiefDesignerStatus { get; set; }

    public string? ApproverID { get; set; }
    public string? ApproverName { get; set; }
    public decimal? ApproverWorkload { get; set; }
    public string? ApproverStatus { get; set; }

    public string? AssigneeStatus { get; set; }
    public bool IsForceAssessment { get; set; }
    public bool IsInPool { get; set; }
}
