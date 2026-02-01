using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.Settings;

/// <summary>
/// 机型管理 - 所有字段使用 camelCase 以匹配前端
/// </summary>
public class EquipmentModelsResponse
{
    [JsonPropertyName("models")]
    public List<string> Models { get; set; } = new();
}

public class AddEquipmentModelRequest
{
    [Required]
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;
}

public class BatchAddEquipmentModelsRequest
{
    [Required]
    [JsonPropertyName("models")]
    public List<string> Models { get; set; } = new();
}

/// <summary>
/// 容量等级管理
/// </summary>
public class CapacityLevelsResponse
{
    [JsonPropertyName("levels")]
    public List<string> Levels { get; set; } = new();
}

public class AddCapacityLevelRequest
{
    [Required]
    [JsonPropertyName("level")]
    public string Level { get; set; } = string.Empty;
}

/// <summary>
/// 差旅标签管理
/// </summary>
public class TravelLabelsResponse
{
    [JsonPropertyName("labels")]
    public List<string> Labels { get; set; } = new();
}

public class AddTravelLabelRequest
{
    [Required]
    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;
}

/// <summary>
/// 用户头像管理
/// </summary>
public class UserAvatarResponse
{
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }  // Base64编码
}

public class SaveUserAvatarRequest
{
    [Required]
    [JsonPropertyName("avatar")]
    public string Avatar { get; set; } = string.Empty;  // Base64编码
}

/// <summary>
/// 任务分类管理
/// </summary>
public class TaskCategoriesResponse
{
    [JsonPropertyName("categories")]
    public Dictionary<string, List<string>> Categories { get; set; } = new();
}

public class UpdateTaskCategoriesRequest
{
    [Required]
    [JsonPropertyName("categories")]
    public List<string> Categories { get; set; } = new();
}

/// <summary>
/// 统一响应
/// </summary>
public class SettingsApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("error")]
    public string? Error { get; set; }
}

/// <summary>
/// 分类标签管理 - 用于差旅任务子分类的细粒度标签
/// </summary>
public class CategoryLabelsResponse
{
    [JsonPropertyName("labels")]
    public List<string> Labels { get; set; } = new();
}

public class UpdateCategoryLabelsRequest
{
    [JsonPropertyName("labels")]
    public List<string> Labels { get; set; } = new();
}

public class AddCategoryLabelRequest
{
    [Required]
    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;
}
