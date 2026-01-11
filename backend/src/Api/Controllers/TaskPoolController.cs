using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.TaskPool;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 任务库控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TaskPoolController : ControllerBase
{
    private readonly ITaskPoolService _taskPoolService;

    public TaskPoolController(ITaskPoolService taskPoolService)
    {
        _taskPoolService = taskPoolService;
    }

    /// <summary>
    /// 获取任务库列�?
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<TaskPoolItemDto>>>> GetPoolItems([FromQuery] TaskPoolQueryParams query)
    {
        var result = await _taskPoolService.GetPoolItemsAsync(query);
        return Ok(new ApiResponse<PaginatedResponse<TaskPoolItemDto>> { Success = true, Data = result });
    }

    /// <summary>
    /// 获取单个计划任务
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TaskPoolItemDto>>> GetPoolItem(string id)
    {
        var item = await _taskPoolService.GetPoolItemByIdAsync(id);
        if (item == null)
        {
            return NotFound(new ApiResponse<TaskPoolItemDto> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "计划任务不存�? } });
        }

        return Ok(new ApiResponse<TaskPoolItemDto> { Success = true, Data = item });
    }

    /// <summary>
    /// 创建计划任务
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskPoolItemDto>>> CreatePoolItem([FromBody] CreateTaskPoolItemRequest request)
    {
        var item = await _taskPoolService.CreatePoolItemAsync(request);
        return CreatedAtAction(nameof(GetPoolItem), new { id = item.Id }, new ApiResponse<TaskPoolItemDto> { Success = true, Data = item, Message = "创建成功" });
    }

    /// <summary>
    /// 更新计划任务
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<TaskPoolItemDto>>> UpdatePoolItem(string id, [FromBody] CreateTaskPoolItemRequest request)
    {
        var item = await _taskPoolService.UpdatePoolItemAsync(id, request);
        return Ok(new ApiResponse<TaskPoolItemDto> { Success = true, Data = item, Message = "更新成功" });
    }

    /// <summary>
    /// 删除计划任务（软删除�?
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeletePoolItem(string id)
    {
        var result = await _taskPoolService.SoftDeletePoolItemAsync(id);
        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "删除成功" })
            : NotFound(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "计划任务不存�? } });
    }

    /// <summary>
    /// 分配任务（转化为正式任务�?
    /// </summary>
    [HttpPost("{id}/assign")]
    public async Task<ActionResult<ApiResponse<AssignTaskResponse>>> AssignTask(string id, [FromBody] AssignTaskRequest request)
    {
        var result = await _taskPoolService.AssignTaskAsync(id, request);
        return Ok(new ApiResponse<AssignTaskResponse> { Success = true, Data = result });
    }

    /// <summary>
    /// 批量分配任务
    /// </summary>
    [HttpPost("batch-assign")]
    public async Task<ActionResult<ApiResponse<BatchAssignResponse>>> BatchAssign([FromBody] BatchAssignRequest request)
    {
        var result = await _taskPoolService.BatchAssignAsync(request);
        return Ok(new ApiResponse<BatchAssignResponse> { Success = true, Data = result });
    }

    /// <summary>
    /// 获取任务库统�?
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<TaskPoolStatisticsResponse>>> GetStatistics()
    {
        var stats = await _taskPoolService.GetStatisticsAsync();
        return Ok(new ApiResponse<TaskPoolStatisticsResponse> { Success = true, Data = stats });
    }

    /// <summary>
    /// 复制计划任务
    /// </summary>
    [HttpPost("{id}/duplicate")]
    public async Task<ActionResult<ApiResponse<TaskPoolItemDto>>> Duplicate(string id, [FromBody] DuplicateRequest? request)
    {
        var item = await _taskPoolService.DuplicateAsync(id, request?.TaskName, request?.DueDate);
        return Ok(new ApiResponse<TaskPoolItemDto> { Success = true, Data = item, Message = "复制成功" });
    }

    /// <summary>
    /// 从任务回�?
    /// </summary>
    [HttpPost("recover-from-task")]
    public async Task<ActionResult<ApiResponse<RetrieveToPoolResponse>>> RetrieveFromTask([FromBody] string taskId)
    {
        var result = await _taskPoolService.RetrieveFromTaskAsync(taskId);
        return Ok(new ApiResponse<RetrieveToPoolResponse> { Success = true, Data = result });
    }
}

public class DuplicateRequest
{
    public string? TaskName { get; set; }
    public DateTime? DueDate { get; set; }
}
