using System.Text.Json.Serialization;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.DTOs.Users;

/// <summary>
/// 用户DTO
/// </summary>
public class UserDto
{
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("systemRole")]
    public SystemRole SystemRole { get; set; }

    [JsonPropertyName("officeLocation")]
    public OfficeLocation OfficeLocation { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("joinDate")]
    public string? JoinDate { get; set; }

    [JsonPropertyName("status")]
    public PersonnelStatus Status { get; set; }

    [JsonPropertyName("education")]
    public string? Education { get; set; }

    [JsonPropertyName("school")]
    public string? School { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }
}
