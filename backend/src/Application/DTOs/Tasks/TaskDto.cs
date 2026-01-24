using System.Text.Json.Serialization;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 任务DTO
/// </summary>
public class TaskDto
{
    [JsonPropertyName("taskId")]
    public string TaskId { get; set; } = string.Empty;
    public string TaskName { get; set; } = string.Empty;
    [JsonPropertyName("taskClassId")]
    public string TaskClassId { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    [JsonPropertyName("projectId")]
    public string? ProjectId { get; set; }
    [JsonPropertyName("assigneeId")]
    public string? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public Domain.Enums.TaskStatus Status { get; set; }
    public decimal? Workload { get; set; }
    public decimal? Difficulty { get; set; }
    public string? Remark { get; set; }
    [JsonPropertyName("createdDate")]
    public string CreatedDate { get; set; } = string.Empty;
    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    // 差旅任务字段
    [JsonPropertyName("travelLocation")]
    public string? TravelLocation { get; set; }
    [JsonPropertyName("travelDuration")]
    public decimal? TravelDuration { get; set; }
    [JsonPropertyName("travelLabel")]
    public string? TravelLabel { get; set; }

    // 会议任务字段
    [JsonPropertyName("meetingDuration")]
    public decimal? MeetingDuration { get; set; }
    public List<string>? Participants { get; set; }
    [JsonPropertyName("participantNames")]
    public List<string>? ParticipantNames { get; set; }

    // 市场任务字段
    [JsonPropertyName("relatedProject")]
    public string? RelatedProject { get; set; }
    [JsonPropertyName("isIndependentBusinessUnit")]
    public bool IsIndependentBusinessUnit { get; set; }

    // 角色字段
    [JsonPropertyName("checkerId")]
    public string? CheckerId { get; set; }
    [JsonPropertyName("checkerName")]
    public string? CheckerName { get; set; }
    [JsonPropertyName("checkerWorkload")]
    public decimal? CheckerWorkload { get; set; }
    [JsonPropertyName("checkerStatus")]
    public RoleStatus? CheckerStatus { get; set; }
    [JsonPropertyName("chiefDesignerId")]
    public string? ChiefDesignerId { get; set; }
    [JsonPropertyName("chiefDesignerName")]
    public string? ChiefDesignerName { get; set; }
    [JsonPropertyName("chiefDesignerWorkload")]
    public decimal? ChiefDesignerWorkload { get; set; }
    [JsonPropertyName("chiefDesignerStatus")]
    public RoleStatus? ChiefDesignerStatus { get; set; }
    [JsonPropertyName("approverId")]
    public string? ApproverId { get; set; }
    [JsonPropertyName("approverName")]
    public string? ApproverName { get; set; }
    [JsonPropertyName("approverWorkload")]
    public decimal? ApproverWorkload { get; set; }
    [JsonPropertyName("approverStatus")]
    public RoleStatus? ApproverStatus { get; set; }
    [JsonPropertyName("assigneeStatus")]
    public RoleStatus? AssigneeStatus { get; set; }
    [JsonPropertyName("isForceAssessment")]
    public bool IsForceAssessment { get; set; }
    [JsonPropertyName("isInPool")]
    public bool IsInPool { get; set; }
}
