namespace R&DTaskSystem.Application.DTOs.TaskClasses;

/// <summary>
/// 任务类别DTO
/// </summary>
public class TaskClassDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Notice { get; set; }
}
