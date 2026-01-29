using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.Users;

/// <summary>
/// 创建用户请求
/// </summary>
public class CreateUserRequest
{
    [Required]
    [MaxLength(50)]
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("systemRole")]
    public string SystemRole { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("officeLocation")]
    public string OfficeLocation { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("joinDate")]
    public DateTime? JoinDate { get; set; }

    [Required]
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("education")]
    public string? Education { get; set; }

    [JsonPropertyName("school")]
    public string? School { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }
}
