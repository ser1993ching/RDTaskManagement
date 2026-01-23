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
    public string Name { get; set; } = string.Empty;
    public SystemRole SystemRole { get; set; }
    public OfficeLocation OfficeLocation { get; set; }
    public string? Title { get; set; }
    public string? JoinDate { get; set; }
    public PersonnelStatus Status { get; set; }
    public string? Education { get; set; }
    public string? School { get; set; }
    public string? Remark { get; set; }
}
