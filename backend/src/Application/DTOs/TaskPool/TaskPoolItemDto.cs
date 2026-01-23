using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.TaskPool;

/// <summary>
/// 任务库项DTO
/// </summary>
public class TaskPoolItemDto
{
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("taskName")]
    public string TaskName { get; set; } = string.Empty;
    [JsonPropertyName("taskClassId")]
    public string TaskClassId { get; set; } = string.Empty;
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
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;
    [JsonPropertyName("createdByName")]
    public string? CreatedByName { get; set; }
    [JsonPropertyName("createdDate")]
    public DateTime CreatedDate { get; set; }
    [JsonPropertyName("isForceAssessment")]
    public bool IsForceAssessment { get; set; }
    public string? Remark { get; set; }
}
