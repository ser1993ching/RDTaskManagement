namespace TaskManageSystem.Application.DTOs.TaskClasses;

/// <summary>
/// 任务类别列表响应
/// </summary>
public class TaskClassListResponse
{
    public List<TaskClassDto> TaskClasses { get; set; } = new();
    public Dictionary<string, List<string>> Categories { get; set; } = new();
}
