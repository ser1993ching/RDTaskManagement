using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.Users;

/// <summary>
/// 用户DTO
/// </summary>
public class UserDto
{
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string SystemRole { get; set; } = string.Empty;
    public string OfficeLocation { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? JoinDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Education { get; set; }
    public string? School { get; set; }
    public string? Remark { get; set; }
}
