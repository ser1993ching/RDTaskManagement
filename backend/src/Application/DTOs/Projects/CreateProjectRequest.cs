namespace TaskManageSystem.Application.DTOs.Projects;

/// <summary>
/// 创建项目请求
/// </summary>
public class CreateProjectRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    public string? WorkNo { get; set; }
    public string? Capacity { get; set; }
    public string? Model { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Remark { get; set; }
    public bool IsKeyProject { get; set; }

    // 市场配合项目特有
    public bool IsWon { get; set; }
    public bool IsForeign { get; set; }

    // 常规/核电项目特有
    public bool IsCommissioned { get; set; }

    // 科研/改�?其他项目特有
    public bool IsCompleted { get; set; }
}
