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
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTaskClass(string id)
    {
        var taskClass = await _taskClassService.GetTaskClassByIdAsync(id);
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
        return CreatedAtAction(nameof(GetTaskClass), new { id = taskClass.Id }, taskClass);
    }

    /// <summary>
    /// 更新任务类别
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTaskClass(string id, [FromBody] UpdateTaskClassRequest request)
    {
        var taskClass = await _taskClassService.UpdateTaskClassAsync(id, request);
        return Ok(taskClass);
    }

    /// <summary>
    /// 删除任务类别
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTaskClass(string id)
    {
        var result = await _taskClassService.SoftDeleteTaskClassAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// 检查任务类别使用情况
    /// </summary>
    [HttpGet("{id}/usage")]
    public async Task<IActionResult> CheckUsage(string id)
    {
        var usage = await _taskClassService.CheckUsageAsync(id);
        return Ok(usage);
    }

    /// <summary>
    /// 添加子类别
    /// </summary>
    [HttpPost("{id}/categories")]
    public async Task<IActionResult> AddCategory(string id, [FromBody] AddCategoryRequest request)
    {
        await _taskClassService.AddCategoryAsync(id, request.Category);
        return Ok(new { Success = true });
    }

    /// <summary>
    /// 移除子类别
    /// </summary>
    [HttpDelete("{id}/categories/{categoryName}")]
    public async Task<IActionResult> RemoveCategory(string id, string categoryName)
    {
        await _taskClassService.RemoveCategoryAsync(id, categoryName);
        return Ok(new { Success = true });
    }

    /// <summary>
    /// 更新子类别名称
    /// </summary>
    [HttpPut("{id}/categories")]
    public async Task<IActionResult> UpdateCategory(string id, [FromBody] UpdateCategoryNameRequest request)
    {
        await _taskClassService.UpdateCategoryNameAsync(id, request.OldName, request.NewName);
        return Ok(new { Success = true });
    }

    /// <summary>
    /// 重新排序子类别
    /// </summary>
    [HttpPut("{id}/categories/order")]
    public async Task<IActionResult> ReorderCategories(string id, [FromBody] ReorderCategoriesRequest request)
    {
        await _taskClassService.ReorderCategoriesAsync(id, request.Order);
        return Ok(new { Success = true });
    }
}
