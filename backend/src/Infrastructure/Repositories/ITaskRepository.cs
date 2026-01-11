using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Infrastructure.Repositories;

/// <summary>
/// 任务仓储接口
/// </summary>
public interface ITaskRepository
{
    Task<TaskItemEntity?> GetByIdAsync(string taskId);
    Task<TaskItemEntity?> GetByIdNoTrackingAsync(string taskId);
    Task<IReadOnlyList<TaskItemEntity>> GetAllAsync();
    Task<IReadOnlyList<TaskItemEntity>> GetByAssigneeAsync(string assigneeId);
    Task<IReadOnlyList<TaskItemEntity>> GetByProjectAsync(string projectId);
    Task<IReadOnlyList<TaskItemEntity>> GetByTaskClassAsync(string taskClassId);
    Task<IReadOnlyList<TaskItemEntity>> GetRelatedToUserAsync(string userId);
    Task<IReadOnlyList<TaskItemEntity>> GetPersonalTasksAsync(string userId, string? status);
    Task<IReadOnlyList<TaskItemEntity>> GetTravelTasksAsync(string userId, string? period);
    Task<IReadOnlyList<TaskItemEntity>> GetMeetingTasksAsync(string userId, string? period);
    Task<TaskItemEntity> CreateAsync(TaskItemEntity task);
    Task<TaskItemEntity> UpdateAsync(TaskItemEntity task);
    Task<bool> SoftDeleteAsync(string taskId);
    Task<bool> IsLongRunningAsync(string taskId, int daysThreshold = 60);
    Task<IReadOnlyList<TaskItemEntity>> GetDelayedTasksAsync(string? userId, int daysThreshold);
    Task<IReadOnlyList<TaskItemEntity>> GetOverdueTasksAsync(string? userId);
}

// 使用别名避免与System.Threading.Tasks.Task冲突
using TaskItemEntity = TaskManageSystem.Domain.Entities.TaskItem;

