using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Application.DTOs.TaskPool;

/// <summary>
/// 分配任务请求 - 从任务库分配任务
/// </summary>
public class AssignTaskRequest
{
    [Required]
    public string TaskName { get; set; } = string.Empty;

    [Required]
    public string TaskClassId { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    public string? ProjectId { get; set; }

    [Required]
    public string AssigneeId { get; set; } = string.Empty;

    public string? AssigneeName { get; set; }
    public string? ReviewerId { get; set; }
    public string? ReviewerName { get; set; }
    public string? ApproverId { get; set; }
    public string? ApproverName { get; set; }
    public decimal? ReviewerWorkload { get; set; }
    public decimal? ApproverWorkload { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal? Workload { get; set; }
    public bool IsForceAssessment { get; set; }
    public string? Remark { get; set; }
}
