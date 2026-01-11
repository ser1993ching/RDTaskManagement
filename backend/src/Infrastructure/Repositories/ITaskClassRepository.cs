using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Infrastructure.Repositories;

/// <summary>
/// 任务类别仓储接口
/// </summary>
public interface ITaskClassRepository
{
    Task<TaskClass?> GetByIdAsync(string id);
    Task<IReadOnlyList<TaskClass>> GetAllAsync();
    Task<TaskClass> CreateAsync(TaskClass taskClass);
    Task<TaskClass> UpdateAsync(TaskClass taskClass);
    Task<bool> SoftDeleteAsync(string id);
    Task<int> CountTasksByClassIdAsync(string taskClassId);
    Task<bool> ExistsAsync(string id);
}
