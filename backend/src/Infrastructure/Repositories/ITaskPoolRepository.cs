using R&DTaskSystem.Domain.Entities;

namespace R&DTaskSystem.Infrastructure.Repositories;

/// <summary>
/// 任务库仓储接口
/// </summary>
public interface ITaskPoolRepository
{
    Task<TaskPoolItem?> GetByIdAsync(string id);
    Task<TaskPoolItem?> GetByIdNoTrackingAsync(string id);
    Task<IReadOnlyList<TaskPoolItem>> GetAllAsync();
    Task<TaskPoolItem> CreateAsync(TaskPoolItem item);
    Task<TaskPoolItem> UpdateAsync(TaskPoolItem item);
    Task<bool> SoftDeleteAsync(string id);
    Task<(int Total, Dictionary<string, int> ByCategory, Dictionary<string, int> ByProject, int Pending, int Assigned)> GetStatisticsAsync();
}
