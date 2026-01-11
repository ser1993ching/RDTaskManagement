namespace R&DTaskSystem.Application.DTOs.Tasks;

/// <summary>
/// 个人任务响应
/// </summary>
public class PersonalTasksResponse
{
    public List<TaskDto> InProgress { get; set; } = new();
    public List<TaskDto> Pending { get; set; } = new();
    public List<TaskDto> Completed { get; set; } = new();
}
