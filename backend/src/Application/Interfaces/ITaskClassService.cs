using System.ComponentModel.DataAnnotations;
using TaskManageSystem.Application.DTOs.TaskClasses;

namespace TaskManageSystem.Application.Interfaces;

/// <summary>
/// 任务类别服务接口
/// </summary>
public interface ITaskClassService
{
    Task<TaskClassListResponse> GetTaskClassesAsync(bool includeDeleted = false);
    Task<TaskClassDto?> GetTaskClassByIdAsync(string id);
    Task<TaskClassDto> CreateTaskClassAsync(CreateTaskClassRequest request);
    Task<TaskClassDto> UpdateTaskClassAsync(string id, UpdateTaskClassRequest request);
    Task<bool> SoftDeleteTaskClassAsync(string id);
    Task<TaskClassUsageResponse> CheckUsageAsync(string id);
    Task AddCategoryAsync(string id, string category);
    Task RemoveCategoryAsync(string id, string categoryName);
    Task UpdateCategoryNameAsync(string id, string oldName, string newName);
    Task ReorderCategoriesAsync(string id, List<string> newOrder);
    Task UpdateCategoriesAsync(string code, List<string> categories);
}

public class UpdateTaskClassRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Notice { get; set; }
}

public class TaskClassUsageResponse
{
    public bool HasTasks { get; set; }
    public int TaskCount { get; set; }
    public string TaskClassCode { get; set; } = string.Empty;
}

public class AddCategoryRequest
{
    [Required]
    public string Category { get; set; } = string.Empty;
}

public class UpdateCategoryNameRequest
{
    [Required]
    public string OldName { get; set; } = string.Empty;

    [Required]
    public string NewName { get; set; } = string.Empty;
}

public class ReorderCategoriesRequest
{
    [Required]
    public List<string> Order { get; set; } = new();
}

public class UpdateCategoriesRequest
{
    [Required]
    public List<string> Categories { get; set; } = new();
}
