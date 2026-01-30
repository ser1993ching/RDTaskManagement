using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Application.Repositories;

/// <summary>
/// 项目仓储接口
/// </summary>
public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(string id);
    Task<Project?> GetByIdNoTrackingAsync(string id);
    Task<IReadOnlyList<Project>> GetAllAsync();
    Task<IReadOnlyList<Project>> GetByCategoryAsync(Domain.Enums.ProjectCategory category);
    Task<Project> CreateAsync(Project project);
    Task<Project> UpdateAsync(Project project);
    Task<bool> SoftDeleteAsync(string id);
    Task<int> CountTasksByProjectIdAsync(string projectId);
    Task<bool> ExistsAsync(string id);
    Task<(int Total, Dictionary<string, int> ByCategory, int KeyProjects, int Completed)> GetStatisticsAsync(Domain.Enums.ProjectCategory? category);
    Task<string?> GetMaxProjectIdAsync();
}
