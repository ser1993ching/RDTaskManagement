namespace TaskManageSystem.Application.DTOs.Projects;

/// <summary>
/// 项目查询参数
/// </summary>
public class ProjectQueryParams : PaginationQuery
{
    public string? Category { get; set; }
    public bool? IsKeyProject { get; set; }
}
