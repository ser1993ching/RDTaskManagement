using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Application.Repositories;

/// <summary>
/// 任务仓储接口
/// </summary>
public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(string taskId);
    Task<TaskItem?> GetByIdNoTrackingAsync(string taskId);
    Task<IReadOnlyList<TaskItem>> GetAllAsync();
    Task<IReadOnlyList<TaskItem>> GetByAssigneeAsync(string assigneeId);
    Task<IReadOnlyList<TaskItem>> GetByProjectAsync(string projectId);
    Task<IReadOnlyList<TaskItem>> GetByTaskClassAsync(string taskClassId);
    Task<IReadOnlyList<TaskItem>> GetRelatedToUserAsync(string userId);
    Task<IReadOnlyList<TaskItem>> GetPersonalTasksAsync(string userId, string? status);
    Task<IReadOnlyList<TaskItem>> GetTravelTasksAsync(string userId, string? period);
    Task<IReadOnlyList<TaskItem>> GetMeetingTasksAsync(string userId, string? period);
    Task<TaskItem> CreateAsync(TaskItem task);
    Task<TaskItem> UpdateAsync(TaskItem task);
    Task<bool> SoftDeleteAsync(string taskId);
    Task<bool> IsLongRunningAsync(string taskId, int daysThreshold = 60);
    Task<IReadOnlyList<TaskItem>> GetDelayedTasksAsync(string? userId, int daysThreshold);
    Task<IReadOnlyList<TaskItem>> GetOverdueTasksAsync(string? userId);
}
