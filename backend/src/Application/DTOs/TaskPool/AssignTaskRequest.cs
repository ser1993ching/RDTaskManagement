using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Application.DTOs.TaskPool;

/// <summary>
/// 分配任务请求
/// </summary>
public class AssignTaskRequest
{
    [Required]
    public string AssignToPoolItemId { get; set; } = string.Empty;

    [Required]
    public string AssigneeId { get; set; } = string.Empty;

    public string? AssigneeName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
}
