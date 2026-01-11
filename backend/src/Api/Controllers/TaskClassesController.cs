using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.TaskClasses;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 任务类别控制�?
/// </summary>
[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<ApiResponse<TaskClassListResponse>>> GetTaskClasses([FromQuery] bool includeDeleted = false)
    {
        var result = await _taskClassService.GetTaskClassesAsync(includeDeleted);
        return Ok(new ApiResponse<TaskClassListResponse> { Success = true, Data = result });
    }

    /// <summary>
    /// 获取单个任务类别
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TaskClassDto>>> GetTaskClass(string id)
    {
        var taskClass = await _taskClassService.GetTaskClassByIdAsync(id);
        if (taskClass == null)
        {
            return NotFound(new ApiResponse<TaskClassDto> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "任务类别不存�? } });
        }

        return Ok(new ApiResponse<TaskClassDto> { Success = true, Data = taskClass });
    }

    /// <summary>
    /// 创建任务类别
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskClassDto>>> CreateTaskClass([FromBody] CreateTaskClassRequest request)
    {
        var taskClass = await _taskClassService.CreateTaskClassAsync(request);
        return CreatedAtAction(nameof(GetTaskClass), new { id = taskClass.Id }, new ApiResponse<TaskClassDto> { Success = true, Data = taskClass, Message = "创建成功" });
    }

    /// <summary>
    /// 更新任务类别
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<TaskClassDto>>> UpdateTaskClass(string id, [FromBody] UpdateTaskClassRequest request)
    {
        var taskClass = await _taskClassService.UpdateTaskClassAsync(id, request);
        return Ok(new ApiResponse<TaskClassDto> { Success = true, Data = taskClass, Message = "更新成功" });
    }

    /// <summary>
    /// 删除任务类别（软删除�?
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTaskClass(string id)
    {
        var result = await _taskClassService.SoftDeleteTaskClassAsync(id);
        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "删除成功" })
            : NotFound(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "任务类别不存�? } });
    }

    /// <summary>
    /// 检查任务类别使用情�?
    /// </summary>
    [HttpGet("{id}/usage")]
    public async Task<ActionResult<ApiResponse<TaskClassUsageResponse>>> CheckUsage(string id)
    {
        var result = await _taskClassService.CheckUsageAsync(id);
        return Ok(new ApiResponse<TaskClassUsageResponse> { Success = true, Data = result });
    }

    /// <summary>
    /// 添加二级分类
    /// </summary>
    [HttpPost("{id}/categories")]
    public async Task<ActionResult<ApiResponse<object>>> AddCategory(string id, [FromBody] AddCategoryRequest request)
    {
        await _taskClassService.AddCategoryAsync(id, request.Category);
        return Ok(new ApiResponse<object> { Success = true, Message = "添加成功" });
    }

    /// <summary>
    /// 删除二级分类
    /// </summary>
    [HttpDelete("{id}/categories/{categoryName}")]
    public async Task<ActionResult<ApiResponse<object>>> RemoveCategory(string id, string categoryName)
    {
        await _taskClassService.RemoveCategoryAsync(id, categoryName);
        return Ok(new ApiResponse<object> { Success = true, Message = "删除成功" });
    }

    /// <summary>
    /// 更新二级分类名称
    /// </summary>
    [HttpPut("{id}/categories/{oldName}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateCategoryName(string id, string oldName, [FromBody] UpdateCategoryNameRequest request)
    {
        await _taskClassService.UpdateCategoryNameAsync(id, oldName, request.NewName);
        return Ok(new ApiResponse<object> { Success = true, Message = "更新成功" });
    }

    /// <summary>
    /// 重新排序二级分类
    /// </summary>
    [HttpPut("{id}/categories/order")]
    public async Task<ActionResult<ApiResponse<object>>> ReorderCategories(string id, [FromBody] ReorderCategoriesRequest request)
    {
        await _taskClassService.ReorderCategoriesAsync(id, request.Order);
        return Ok(new ApiResponse<object> { Success = true, Message = "排序成功" });
    }

    /// <summary>
    /// 更新全部二级分类
    /// </summary>
    [HttpPut("categories/{code}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateCategories(string code, [FromBody] UpdateCategoriesRequest request)
    {
        await _taskClassService.UpdateCategoriesAsync(code, request.Categories);
        return Ok(new ApiResponse<object> { Success = true, Message = "更新成功" });
    }
}
