namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 任务DTO
/// </summary>
public class TaskDto
{
    [System.Text.Json.Serialization.JsonPropertyName("taskID")]
    public string TaskID { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("taskName")]
    public string TaskName { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("taskClassID")]
    public string TaskClassID { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("projectID")]
    public string? ProjectID { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("assigneeID")]
    public string? AssigneeID { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("assigneeName")]
    public string? AssigneeName { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("dueDate")]
    public DateTime? DueDate { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("completedDate")]
    public DateTime? CompletedDate { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("workload")]
    public decimal? Workload { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("difficulty")]
    public decimal? Difficulty { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("remark")]
    public string? Remark { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("createdDate")]
    public string CreatedDate { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    // 差旅任务字段
    [System.Text.Json.Serialization.JsonPropertyName("travelLocation")]
    public string? TravelLocation { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("travelDuration")]
    public decimal? TravelDuration { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("travelLabel")]
    public string? TravelLabel { get; set; }

    // 会议任务字段
    [System.Text.Json.Serialization.JsonPropertyName("meetingDuration")]
    public decimal? MeetingDuration { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("participants")]
    public List<string>? Participants { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("participantNames")]
    public List<string>? ParticipantNames { get; set; }

    // 市场任务字段
    [System.Text.Json.Serialization.JsonPropertyName("capacityLevel")]
    public string? CapacityLevel { get; set; }

    // 角色字段
    [System.Text.Json.Serialization.JsonPropertyName("checkerID")]
    public string? CheckerID { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("checkerName")]
    public string? CheckerName { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("checkerWorkload")]
    public decimal? CheckerWorkload { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("checkerStatus")]
    public string? CheckerStatus { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("chiefDesignerID")]
    public string? ChiefDesignerID { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("chiefDesignerName")]
    public string? ChiefDesignerName { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("chiefDesignerWorkload")]
    public decimal? ChiefDesignerWorkload { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("chiefDesignerStatus")]
    public string? ChiefDesignerStatus { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("approverID")]
    public string? ApproverID { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("approverName")]
    public string? ApproverName { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("approverWorkload")]
    public decimal? ApproverWorkload { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("approverStatus")]
    public string? ApproverStatus { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("assigneeStatus")]
    public string? AssigneeStatus { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("isForceAssessment")]
    public bool IsForceAssessment { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("isInPool")]
    public bool IsInPool { get; set; }
}
