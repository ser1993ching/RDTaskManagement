using R&DTaskSystem.Domain.Entities;

namespace R&DTaskSystem.Infrastructure.Repositories;

/// <summary>
/// 任务仓储接口
/// </summary>
public interface ITaskRepository
{
    Task<TaskEntity?> GetByIdAsync(string taskId);
    Task<TaskEntity?> GetByIdNoTrackingAsync(string taskId);
    Task<IReadOnlyList<TaskEntity>> GetAllAsync();
    Task<IReadOnlyList<TaskEntity>> GetByAssigneeAsync(string assigneeId);
    Task<IReadOnlyList<TaskEntity>> GetByProjectAsync(string projectId);
    Task<IReadOnlyList<TaskEntity>> GetByTaskClassAsync(string taskClassId);
    Task<IReadOnlyList<TaskEntity>> GetRelatedToUserAsync(string userId);
    Task<IReadOnlyList<TaskEntity>> GetPersonalTasksAsync(string userId, string? status);
    Task<IReadOnlyList<TaskEntity>> GetTravelTasksAsync(string userId, string? period);
    Task<IReadOnlyList<TaskEntity>> GetMeetingTasksAsync(string userId, string? period);
    Task<TaskEntity> CreateAsync(TaskEntity task);
    Task<TaskEntity> UpdateAsync(TaskEntity task);
    Task<bool> SoftDeleteAsync(string taskId);
    Task<bool> IsLongRunningAsync(string taskId, int daysThreshold = 60);
    Task<IReadOnlyList<TaskEntity>> GetDelayedTasksAsync(string? userId, int daysThreshold);
    Task<IReadOnlyList<TaskEntity>> GetOverdueTasksAsync(string? userId);
}

// 使用别名避免与Domain.Task冲突
using TaskEntity = R&DTaskSystem.Domain.Entities.Task;
