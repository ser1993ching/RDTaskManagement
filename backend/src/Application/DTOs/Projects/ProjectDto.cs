using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.DTOs.Projects;

/// <summary>
/// 项目DTO
/// </summary>
public class ProjectDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ProjectCategory Category { get; set; }
    public string? WorkNo { get; set; }
    public string? Capacity { get; set; }
    public string? Model { get; set; }
    public bool IsWon { get; set; }
    public bool IsForeign { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Remark { get; set; }
    public bool IsCommissioned { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsKeyProject { get; set; }
}
