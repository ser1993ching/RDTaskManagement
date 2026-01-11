using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Projects;

namespace TaskManageSystem.Application.Interfaces;

/// <summary>
/// 项目服务接口
/// </summary>
public interface IProjectService
{
    Task<PaginatedResponse<ProjectDto>> GetProjectsAsync(ProjectQueryParams query);
    Task<ProjectDto?> GetProjectByIdAsync(string id);
    Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request);
    Task<ProjectDto> UpdateProjectAsync(string id, UpdateProjectRequest request);
    Task<bool> SoftDeleteProjectAsync(string id);
    Task<bool> IsProjectInUseAsync(string id);
    Task<ProjectStatisticsResponse> GetStatisticsAsync(string? category);
}

public class ProjectStatisticsResponse
{
    public int Total { get; set; }
    public Dictionary<string, int> ByCategory { get; set; } = new();
    public int KeyProjects { get; set; }
    public int Completed { get; set; }
}
