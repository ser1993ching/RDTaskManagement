using System.Text.Json.Serialization;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.DTOs.Projects;

/// <summary>
/// 项目DTO
/// </summary>
public class ProjectDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("category")]
    public ProjectCategory Category { get; set; }

    [JsonPropertyName("workNo")]
    public string? WorkNo { get; set; }

    [JsonPropertyName("capacity")]
    public string? Capacity { get; set; }

    [JsonPropertyName("model")]
    public string? Model { get; set; }

    [JsonPropertyName("isWon")]
    public bool IsWon { get; set; }

    [JsonPropertyName("isForeign")]
    public bool IsForeign { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime? EndDate { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }

    [JsonPropertyName("isCommissioned")]
    public bool IsCommissioned { get; set; }

    [JsonPropertyName("isCompleted")]
    public bool IsCompleted { get; set; }

    [JsonPropertyName("isKeyProject")]
    public bool IsKeyProject { get; set; }
}
