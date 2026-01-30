using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.TaskClasses;

/// <summary>
/// 任务类别DTO
/// </summary>
public class TaskClassDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("notice")]
    public string? Notice { get; set; }
}
