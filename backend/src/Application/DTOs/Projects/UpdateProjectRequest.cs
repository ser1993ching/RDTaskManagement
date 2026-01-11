namespace TaskManageSystem.Application.DTOs.Projects;

/// <summary>
/// 更新项目请求
/// </summary>
public class UpdateProjectRequest
{
    public string? Name { get; set; }
    public string? Category { get; set; }
    public string? WorkNo { get; set; }
    public string? Capacity { get; set; }
    public string? Model { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Remark { get; set; }
    public bool IsKeyProject { get; set; }
    public bool IsWon { get; set; }
    public bool IsForeign { get; set; }
    public bool IsCommissioned { get; set; }
    public bool IsCompleted { get; set; }
}
