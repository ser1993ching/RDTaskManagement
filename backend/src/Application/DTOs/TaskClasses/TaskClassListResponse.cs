using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.TaskClasses;

/// <summary>
/// 任务类别列表响应
/// </summary>
public class TaskClassListResponse
{
    [JsonPropertyName("taskClasses")]
    public List<TaskClassDto> TaskClasses { get; set; } = new();

    [JsonPropertyName("categories")]
    public Dictionary<string, List<string>> Categories { get; set; } = new();
}
