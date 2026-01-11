namespace R&DTaskSystem.Application.DTOs.Settings;

/// <summary>
/// 机型管理
/// </summary>
public class EquipmentModelsResponse
{
    public List<string> Models { get; set; } = new();
}

public class AddEquipmentModelRequest
{
    [Required]
    public string Model { get; set; } = string.Empty;
}

public class BatchAddEquipmentModelsRequest
{
    [Required]
    public List<string> Models { get; set; } = new();
}

/// <summary>
/// 容量等级管理
/// </summary>
public class CapacityLevelsResponse
{
    public List<string> Levels { get; set; } = new();
}

public class AddCapacityLevelRequest
{
    [Required]
    public string Level { get; set; } = string.Empty;
}

/// <summary>
/// 差旅标签管理
/// </summary>
public class TravelLabelsResponse
{
    public List<string> Labels { get; set; } = new();
}

public class AddTravelLabelRequest
{
    [Required]
    public string Label { get; set; } = string.Empty;
}

/// <summary>
/// 用户头像管理
/// </summary>
public class UserAvatarResponse
{
    public string UserId { get; set; } = string.Empty;
    public string? Avatar { get; set; }  // Base64编码
}

public class SaveUserAvatarRequest
{
    [Required]
    public string Avatar { get; set; } = string.Empty;  // Base64编码
}

/// <summary>
/// 任务分类管理
/// </summary>
public class TaskCategoriesResponse
{
    public Dictionary<string, List<string>> Categories { get; set; } = new();
}

public class UpdateTaskCategoriesRequest
{
    [Required]
    public List<string> Categories { get; set; } = new();
}

/// <summary>
/// 统一响应
/// </summary>
public class SettingsApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public string? Error { get; set; }
}
