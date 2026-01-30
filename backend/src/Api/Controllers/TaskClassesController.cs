using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.TaskClasses;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 任务类别控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "LEADER,ADMIN")]
public class TaskClassesController : ControllerBase
{
    private readonly ITaskClassService _taskClassService;

    public TaskClassesController(ITaskClassService taskClassService)
    {
        _taskClassService = taskClassService;
    }

    /// <summary>
    /// 获取任务类别列表
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTaskClasses([FromQuery] bool includeDeleted = false)
    {
        var result = await _taskClassService.GetTaskClassesAsync(includeDeleted);
        return Ok(result);
    }

    /// <summary>
    /// 获取单个任务类别
    /// </summary>
    [HttpGet("{taskClassId}")]
    public async Task<IActionResult> GetTaskClass(string taskClassId)
    {
        var taskClass = await _taskClassService.GetTaskClassByIdAsync(taskClassId);
        if (taskClass == null)
            return NotFound();
        return Ok(taskClass);
    }

    /// <summary>
    /// 创建任务类别
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateTaskClass([FromBody] CreateTaskClassRequest request)
    {
        var taskClass = await _taskClassService.CreateTaskClassAsync(request);
        return CreatedAtAction(nameof(GetTaskClass), new { taskClassId = taskClass.Id }, taskClass);
    }

    /// <summary>
    /// 更新任务类别
    /// </summary>
    [HttpPut("{taskClassId}")]
    public async Task<IActionResult> UpdateTaskClass(string taskClassId, [FromBody] UpdateTaskClassRequest request)
    {
        var taskClass = await _taskClassService.UpdateTaskClassAsync(taskClassId, request);
        return Ok(taskClass);
    }

    /// <summary>
    /// 删除任务类别
    /// </summary>
    [HttpDelete("{taskClassId}")]
    public async Task<IActionResult> DeleteTaskClass(string taskClassId)
    {
        var result = await _taskClassService.SoftDeleteTaskClassAsync(taskClassId);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// 检查任务类别使用情况
    /// </summary>
    [HttpGet("{taskClassId}/usage")]
    public async Task<IActionResult> CheckUsage(string taskClassId)
    {
        var usage = await _taskClassService.CheckUsageAsync(taskClassId);
        return Ok(usage);
    }

    /// <summary>
    /// 添加子类别
    /// </summary>
    [HttpPost("{taskClassId}/categories")]
    public async Task<IActionResult> AddCategory(string taskClassId, [FromBody] AddCategoryRequest request)
    {
        await _taskClassService.AddCategoryAsync(taskClassId, request.Category);
        return Ok(new { Success = true });
    }

    /// <summary>
    /// 移除子类别
    /// </summary>
    [HttpDelete("{taskClassId}/categories/{categoryName}")]
    public async Task<IActionResult> RemoveCategory(string taskClassId, string categoryName)
    {
        await _taskClassService.RemoveCategoryAsync(taskClassId, categoryName);
        return Ok(new { Success = true });
    }

    /// <summary>
    /// 更新子类别名称
    /// </summary>
    [HttpPut("{taskClassId}/categories")]
    public async Task<IActionResult> UpdateCategory(string taskClassId, [FromBody] UpdateCategoryNameRequest request)
    {
        await _taskClassService.UpdateCategoryNameAsync(taskClassId, request.OldName, request.NewName);
        return Ok(new { Success = true });
    }

    /// <summary>
    /// 重新排序子类别
    /// </summary>
    [HttpPut("{taskClassId}/categories/order")]
    public async Task<IActionResult> ReorderCategories(string taskClassId, [FromBody] ReorderCategoriesRequest request)
    {
        await _taskClassService.ReorderCategoriesAsync(taskClassId, request.Order);
        return Ok(new { Success = true });
    }
}
