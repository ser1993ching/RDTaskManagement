using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.TaskPool;

/// <summary>
/// 分配任务请求 - 从任务库分配任务
/// </summary>
public class AssignTaskRequest
{
    [Required]
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

    [Required]
    [JsonPropertyName("assigneeId")]
    public string AssigneeId { get; set; } = string.Empty;

    [JsonPropertyName("assigneeName")]
    public string? AssigneeName { get; set; }

    [JsonPropertyName("reviewerId")]
    public string? ReviewerId { get; set; }

    [JsonPropertyName("reviewerName")]
    public string? ReviewerName { get; set; }

    [JsonPropertyName("approverId")]
    public string? ApproverId { get; set; }

    [JsonPropertyName("approverName")]
    public string? ApproverName { get; set; }

    [JsonPropertyName("reviewerWorkload")]
    public decimal? ReviewerWorkload { get; set; }

    [JsonPropertyName("approverWorkload")]
    public decimal? ApproverWorkload { get; set; }

    [JsonPropertyName("chiefDesignerWorkload")]
    public decimal? ChiefDesignerWorkload { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    [JsonPropertyName("dueDate")]
    public DateTime? DueDate { get; set; }

    [JsonPropertyName("workload")]
    public decimal? Workload { get; set; }

    [JsonPropertyName("isForceAssessment")]
    public bool IsForceAssessment { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }

    [JsonPropertyName("dongfangTaskType")]
    public string? DongfangTaskType { get; set; }
}
