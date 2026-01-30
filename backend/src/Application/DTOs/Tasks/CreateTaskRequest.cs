using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 创建任务请求
/// </summary>
public class CreateTaskRequest
{
    [Required]
    [MaxLength(200)]
    [JsonPropertyName("taskName")]
    public string TaskName { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("taskClassId")]
    public string TaskClassId { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("projectId")]
    public string? ProjectId { get; set; }

    [JsonPropertyName("assigneeId")]
    public string? AssigneeId { get; set; }

    [JsonPropertyName("assigneeName")]
    public string? AssigneeName { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    [JsonPropertyName("dueDate")]
    public DateTime? DueDate { get; set; }

    [Range(0.5, 3.0)]
    [JsonPropertyName("difficulty")]
    public decimal? Difficulty { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }

    [JsonPropertyName("isForceAssessment")]
    public bool? IsForceAssessment { get; set; }

    // 角色分配
    [JsonPropertyName("checkerId")]
    public string? CheckerId { get; set; }

    [JsonPropertyName("chiefDesignerId")]
    public string? ChiefDesignerId { get; set; }

    [JsonPropertyName("approverId")]
    public string? ApproverId { get; set; }

    // 差旅任务
    [JsonPropertyName("travelLocation")]
    public string? TravelLocation { get; set; }

    [JsonPropertyName("travelDuration")]
    public decimal? TravelDuration { get; set; }

    [JsonPropertyName("travelLabel")]
    public string? TravelLabel { get; set; }

    // 会议任务
    [JsonPropertyName("meetingDuration")]
    public decimal? MeetingDuration { get; set; }

    [JsonPropertyName("participants")]
    public List<string>? Participants { get; set; }

    // 市场任务
    [JsonPropertyName("capacityLevel")]
    public string? CapacityLevel { get; set; }

    [JsonPropertyName("relatedProject")]
    public string? RelatedProject { get; set; }

    [JsonPropertyName("isIndependentBusinessUnit")]
    public bool IsIndependentBusinessUnit { get; set; }

    // 工作量
    [JsonPropertyName("workload")]
    public decimal? Workload { get; set; }
}
