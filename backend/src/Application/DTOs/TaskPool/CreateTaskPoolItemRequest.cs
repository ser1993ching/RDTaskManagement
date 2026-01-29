using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.TaskPool;

/// <summary>
/// 创建任务库项请求
/// </summary>
public class CreateTaskPoolItemRequest
{
    [Required]
    [MaxLength(200)]
    [JsonPropertyName("taskName")]
    public string TaskName { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("taskClassId")]
    public string TaskClassId { get; set; } = string.Empty;

    [MaxLength(100)]
    [JsonPropertyName("category")]
    public string? Category { get; set; }

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

    [JsonPropertyName("isForceAssessment")]
    public bool IsForceAssessment { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }

    // 创建人信息（来自前端）
    [JsonPropertyName("createdBy")]
    public string? CreatedBy { get; set; }

    [JsonPropertyName("createdByName")]
    public string? CreatedByName { get; set; }

    [JsonPropertyName("createdDate")]
    public DateTime? CreatedDate { get; set; }
}
