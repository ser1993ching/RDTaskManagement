using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Tasks;

namespace TaskManageSystem.Application.Interfaces;

/// <summary>
/// 任务服务接口
/// </summary>
public interface ITaskService
{
    Task<PaginatedResponse<TaskDto>> GetTasksAsync(TaskQueryParams query);
    Task<TaskDto?> GetTaskByIdAsync(string taskId);
    Task<TaskDto> CreateTaskAsync(CreateTaskRequest request);
    Task<TaskDto> UpdateTaskAsync(string taskId, CreateTaskRequest request);
    Task<bool> SoftDeleteTaskAsync(string taskId);
    Task<TaskDto> UpdateTaskStatusAsync(string taskId, string status);
    Task<TaskDto> UpdateRoleStatusAsync(string taskId, UpdateRoleStatusRequest request);
    Task<TaskDto> CompleteAllRolesAsync(string taskId);
    Task<TaskDto> RetrieveToPoolAsync(string taskId);
    Task<PersonalTasksResponse> GetPersonalTasksAsync(string userId);
    Task<TravelTasksResponse> GetTravelTasksAsync(string userId, string? period);
    Task<MeetingTasksResponse> GetMeetingTasksAsync(string userId, string? period);
    Task<bool> IsLongRunningTaskAsync(string taskId);
    Task BatchOperationAsync(BatchOperationRequest request);
}

public class TravelTasksResponse
{
    public List<TaskDto> Tasks { get; set; } = new();
    public decimal TotalDays { get; set; }
}

public class MeetingTasksResponse
{
    public List<TaskDto> Tasks { get; set; } = new();
    public decimal TotalHours { get; set; }
}

public class BatchOperationRequest
{
    public List<string> TaskIds { get; set; } = new();
    public string Action { get; set; } = string.Empty;  // delete, status, assignee
    public object? Value { get; set; }
}
