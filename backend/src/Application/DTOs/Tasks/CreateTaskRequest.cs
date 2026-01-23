using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 创建任务请求
/// </summary>
public class CreateTaskRequest
{
    [Required]
    [MaxLength(200)]
    [System.Text.Json.Serialization.JsonPropertyName("taskName")]
    public string TaskName { get; set; } = string.Empty;

    [Required]
    [System.Text.Json.Serialization.JsonPropertyName("taskClassID")]
    public string TaskClassID { get; set; } = string.Empty;

    [Required]
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

    [Range(0.5, 3.0)]
    [System.Text.Json.Serialization.JsonPropertyName("difficulty")]
    public decimal? Difficulty { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("remark")]
    public string? Remark { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("isForceAssessment")]
    public bool IsForceAssessment { get; set; }

    // 角色分配
    [System.Text.Json.Serialization.JsonPropertyName("checkerID")]
    public string? CheckerID { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("chiefDesignerID")]
    public string? ChiefDesignerID { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("approverID")]
    public string? ApproverID { get; set; }

    // 差旅任务
    [System.Text.Json.Serialization.JsonPropertyName("travelLocation")]
    public string? TravelLocation { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("travelDuration")]
    public decimal? TravelDuration { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("travelLabel")]
    public string? TravelLabel { get; set; }

    // 会议任务
    [System.Text.Json.Serialization.JsonPropertyName("meetingDuration")]
    public decimal? MeetingDuration { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("participants")]
    public List<string>? Participants { get; set; }

    // 市场任务
    [System.Text.Json.Serialization.JsonPropertyName("capacityLevel")]
    public string? CapacityLevel { get; set; }

    // 工作量
    [System.Text.Json.Serialization.JsonPropertyName("workload")]
    public decimal? Workload { get; set; }
}
