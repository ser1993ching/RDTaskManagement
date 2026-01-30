using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.TaskPool;

/// <summary>
/// 任务库项DTO - 所有字段使用 camelCase 以匹配前端
/// </summary>
public class TaskPoolItemDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("taskName")]
    public string TaskName { get; set; } = string.Empty;

    [JsonPropertyName("taskClassId")]
    public string TaskClassId { get; set; } = string.Empty;

    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("projectId")]
    public string? ProjectId { get; set; }

    [JsonPropertyName("projectName")]
    public string? ProjectName { get; set; }

    [JsonPropertyName("personInChargeId")]
    public string? PersonInChargeId { get; set; }

    [JsonPropertyName("personInChargeName")]
    public string? PersonInChargeName { get; set; }

    [JsonPropertyName("checkerId")]
    public string? CheckerId { get; set; }

    [JsonPropertyName("checkerName")]
    public string? CheckerName { get; set; }

    [JsonPropertyName("chiefDesignerId")]
    public string? ChiefDesignerId { get; set; }

    [JsonPropertyName("chiefDesignerName")]
    public string? ChiefDesignerName { get; set; }

    [JsonPropertyName("approverId")]
    public string? ApproverId { get; set; }

    [JsonPropertyName("approverName")]
    public string? ApproverName { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    [JsonPropertyName("dueDate")]
    public DateTime? DueDate { get; set; }

    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("createdByName")]
    public string? CreatedByName { get; set; }

    [JsonPropertyName("createdDate")]
    public string CreatedDate { get; set; } = string.Empty;

    [JsonPropertyName("isForceAssessment")]
    public bool IsForceAssessment { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }

    [JsonPropertyName("isDeleted")]
    public bool IsDeleted { get; set; }
}
