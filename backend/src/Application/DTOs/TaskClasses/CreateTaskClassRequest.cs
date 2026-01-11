namespace R&DTaskSystem.Application.DTOs.TaskClasses;

/// <summary>
/// 创建任务类别请求
/// </summary>
public class CreateTaskClassRequest
{
    [Required]
    [MaxLength(20)]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string? Notice { get; set; }
    public List<string>? Categories { get; set; }
}
