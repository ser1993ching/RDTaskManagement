using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Settings;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 系统设置控制�?
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    #region 机型管理

    [HttpGet("equipment-models")]
    public async Task<ActionResult<ApiResponse<EquipmentModelsResponse>>> GetEquipmentModels()
    {
        var result = await _settingsService.GetEquipmentModelsAsync();
        return Ok(new ApiResponse<EquipmentModelsResponse> { Success = true, Data = result });
    }

    [HttpPost("equipment-models")]
    public async Task<ActionResult<ApiResponse<object>>> AddEquipmentModel([FromBody] AddEquipmentModelRequest request)
    {
        var result = await _settingsService.AddEquipmentModelAsync(request);
        return Ok(result);
    }

    [HttpDelete("equipment-models/{model}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteEquipmentModel(string model)
    {
        var result = await _settingsService.DeleteEquipmentModelAsync(model);
        return Ok(result);
    }

    [HttpPost("equipment-models/batch")]
    public async Task<ActionResult<ApiResponse<object>>> BatchAddEquipmentModels([FromBody] BatchAddEquipmentModelsRequest request)
    {
        var result = await _settingsService.BatchAddEquipmentModelsAsync(request);
        return Ok(result);
    }

    #endregion

    #region 容量等级管理

    [HttpGet("capacity-levels")]
    public async Task<ActionResult<ApiResponse<CapacityLevelsResponse>>> GetCapacityLevels()
    {
        var result = await _settingsService.GetCapacityLevelsAsync();
        return Ok(new ApiResponse<CapacityLevelsResponse> { Success = true, Data = result });
    }

    [HttpPost("capacity-levels")]
    public async Task<ActionResult<ApiResponse<object>>> AddCapacityLevel([FromBody] AddCapacityLevelRequest request)
    {
        var result = await _settingsService.AddCapacityLevelAsync(request);
        return Ok(result);
    }

    [HttpDelete("capacity-levels/{level}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCapacityLevel(string level)
    {
        var result = await _settingsService.DeleteCapacityLevelAsync(level);
        return Ok(result);
    }

    #endregion

    #region 差旅标签管理

    [HttpGet("travel-labels")]
    public async Task<ActionResult<ApiResponse<TravelLabelsResponse>>> GetTravelLabels()
    {
        var result = await _settingsService.GetTravelLabelsAsync();
        return Ok(new ApiResponse<TravelLabelsResponse> { Success = true, Data = result });
    }

    [HttpPost("travel-labels")]
    public async Task<ActionResult<ApiResponse<object>>> AddTravelLabel([FromBody] AddTravelLabelRequest request)
    {
        var result = await _settingsService.AddTravelLabelAsync(request);
        return Ok(result);
    }

    [HttpDelete("travel-labels/{label}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTravelLabel(string label)
    {
        var result = await _settingsService.DeleteTravelLabelAsync(label);
        return Ok(result);
    }

    #endregion

    #region 用户头像管理

    [HttpGet("avatars/{userId}")]
    public async Task<ActionResult<ApiResponse<UserAvatarResponse>>> GetUserAvatar(string userId)
    {
        var result = await _settingsService.GetUserAvatarAsync(userId);
        return Ok(new ApiResponse<UserAvatarResponse> { Success = true, Data = result });
    }

    [HttpPost("avatars/{userId}")]
    public async Task<ActionResult<ApiResponse<object>>> SaveUserAvatar(string userId, [FromBody] SaveUserAvatarRequest request)
    {
        var result = await _settingsService.SaveUserAvatarAsync(userId, request);
        return Ok(result);
    }

    [HttpDelete("avatars/{userId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteUserAvatar(string userId)
    {
        var result = await _settingsService.DeleteUserAvatarAsync(userId);
        return Ok(result);
    }

    #endregion

    #region 任务分类管理

    [HttpGet("task-categories")]
    public async Task<ActionResult<ApiResponse<TaskCategoriesResponse>>> GetTaskCategories()
    {
        var result = await _settingsService.GetTaskCategoriesAsync();
        return Ok(new ApiResponse<TaskCategoriesResponse> { Success = true, Data = result });
    }

    [HttpPut("task-categories/{code}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateTaskCategories(string code, [FromBody] UpdateTaskCategoriesRequest request)
    {
        var result = await _settingsService.UpdateTaskCategoriesAsync(code, request);
        return Ok(result);
    }

    #endregion

    #region 数据管理

    [HttpPost("reset-all-data")]
    public async Task<ActionResult<ApiResponse<object>>> ResetAllData()
    {
        var result = await _settingsService.ResetAllDataAsync();
        return Ok(result);
    }

    [HttpPost("refresh-tasks")]
    public async Task<ActionResult<ApiResponse<object>>> RefreshTasks()
    {
        var result = await _settingsService.RefreshTasksAsync();
        return Ok(result);
    }

    [HttpPost("migrate")]
    public async Task<ActionResult<ApiResponse<object>>> MigrateData()
    {
        var result = await _settingsService.MigrateDataAsync();
        return Ok(result);
    }

    #endregion
}
