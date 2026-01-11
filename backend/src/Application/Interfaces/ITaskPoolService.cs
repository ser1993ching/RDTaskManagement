namespace TaskManageSystem.Application.Interfaces;

/// <summary>
/// 任务库服务接�?
/// </summary>
public interface ITaskPoolService
{
    Task<PaginatedResponse<TaskPoolItemDto>> GetPoolItemsAsync(TaskPoolQueryParams query);
    Task<TaskPoolItemDto?> GetPoolItemByIdAsync(string id);
    Task<TaskPoolItemDto> CreatePoolItemAsync(CreateTaskPoolItemRequest request);
    Task<TaskPoolItemDto> UpdatePoolItemAsync(string id, CreateTaskPoolItemRequest request);
    Task<bool> SoftDeletePoolItemAsync(string id);
    Task<AssignTaskResponse> AssignTaskAsync(string poolItemId, AssignTaskRequest request);
    Task<BatchAssignResponse> BatchAssignAsync(BatchAssignRequest request);
    Task<TaskPoolStatisticsResponse> GetStatisticsAsync();
    Task<TaskPoolItemDto> DuplicateAsync(string id, string? newTaskName, DateTime? newDueDate);
    Task<RetrieveToPoolResponse> RetrieveFromTaskAsync(string taskId);
}

public class TaskPoolQueryParams : PaginationQuery
{
    public string? TaskClassID { get; set; }
    public string? Category { get; set; }
    public string? ProjectID { get; set; }
    public string? PersonInChargeID { get; set; }
}

public class BatchAssignRequest
{
    [Required]
    public List<string> PoolItemIds { get; set; } = new();

    [Required]
    public string AssigneeId { get; set; } = string.Empty;

    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
}

public class AssignTaskResponse
{
    public bool Success { get; set; }
    public string TaskId { get; set; } = string.Empty;
    public string TaskPoolItemId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class BatchAssignResponse
{
    public bool Success { get; set; }
    public int AssignedCount { get; set; }
    public int FailedCount { get; set; }
    public List<string> TaskIds { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}

public class TaskPoolStatisticsResponse
{
    public int Total { get; set; }
    public Dictionary<string, int> ByCategory { get; set; } = new();
    public Dictionary<string, int> ByProject { get; set; } = new();
    public int Pending { get; set; }
    public int Assigned { get; set; }
}

public class RetrieveToPoolResponse
{
    public bool Success { get; set; }
    public string PoolItemId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
