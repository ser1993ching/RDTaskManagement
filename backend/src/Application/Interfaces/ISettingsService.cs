using TaskManageSystem.Application.DTOs.Settings;

namespace TaskManageSystem.Application.Interfaces;

/// <summary>
/// 系统配置服务接口
/// </summary>
public interface ISettingsService
{
    // 机型管理
    Task<EquipmentModelsResponse> GetEquipmentModelsAsync();
    Task<SettingsApiResponse<object>> AddEquipmentModelAsync(AddEquipmentModelRequest request);
    Task<SettingsApiResponse<object>> DeleteEquipmentModelAsync(string model);
    Task<SettingsApiResponse<object>> BatchAddEquipmentModelsAsync(BatchAddEquipmentModelsRequest request);

    // 容量等级管理
    Task<CapacityLevelsResponse> GetCapacityLevelsAsync();
    Task<SettingsApiResponse<object>> AddCapacityLevelAsync(AddCapacityLevelRequest request);
    Task<SettingsApiResponse<object>> DeleteCapacityLevelAsync(string level);

    // 差旅标签管理
    Task<TravelLabelsResponse> GetTravelLabelsAsync();
    Task<SettingsApiResponse<object>> AddTravelLabelAsync(AddTravelLabelRequest request);
    Task<SettingsApiResponse<object>> DeleteTravelLabelAsync(string label);

    // 用户头像管理
    Task<UserAvatarResponse?> GetUserAvatarAsync(string userId);
    Task<SettingsApiResponse<object>> SaveUserAvatarAsync(string userId, SaveUserAvatarRequest request);
    Task<SettingsApiResponse<object>> DeleteUserAvatarAsync(string userId);

    // 任务分类管理
    Task<TaskCategoriesResponse> GetTaskCategoriesAsync();
    Task<SettingsApiResponse<object>> UpdateTaskCategoriesAsync(string code, UpdateTaskCategoriesRequest request);

    // 分类标签管理（差旅任务子分类标签）
    Task<CategoryLabelsResponse> GetCategoryLabelsAsync(string taskClassCode, string categoryName);
    Task<SettingsApiResponse<object>> UpdateCategoryLabelsAsync(string taskClassCode, string categoryName, UpdateCategoryLabelsRequest request);
    Task<SettingsApiResponse<object>> AddCategoryLabelAsync(string taskClassCode, string categoryName, AddCategoryLabelRequest request);
    Task<SettingsApiResponse<object>> DeleteCategoryLabelAsync(string taskClassCode, string categoryName, string label);

    // 数据管理
    Task<SettingsApiResponse<object>> ResetAllDataAsync();
    Task<SettingsApiResponse<object>> RefreshTasksAsync();
    Task<SettingsApiResponse<object>> MigrateDataAsync();
}
