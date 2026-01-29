using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.TaskPool;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 任务库控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TaskPoolController : ControllerBase
{
    private readonly ITaskPoolService _taskPoolService;

    public TaskPoolController(ITaskPoolService taskPoolService)
    {
        _taskPoolService = taskPoolService;
    }

    /// <summary>
    /// 获取任务库列表
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetPoolItems([FromQuery] TaskPoolQueryParams query)
    {
        var result = await _taskPoolService.GetPoolItemsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// 获取任务库统计
    /// </summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        var stats = await _taskPoolService.GetStatisticsAsync();
        return Ok(stats);
    }

    /// <summary>
    /// 获取单个任务库项
    /// </summary>
    [HttpGet("{poolItemId}")]
    public async Task<IActionResult> GetPoolItem(string poolItemId)
    {
        var item = await _taskPoolService.GetPoolItemByIdAsync(poolItemId);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// 创建任务库项
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreatePoolItem([FromBody] CreateTaskPoolItemRequest request)
    {
        var item = await _taskPoolService.CreatePoolItemAsync(request);
        return CreatedAtAction(nameof(GetPoolItem), new { poolItemId = item.Id }, item);
    }

    /// <summary>
    /// 更新任务库项
    /// </summary>
    [HttpPut("{poolItemId}")]
    public async Task<IActionResult> UpdatePoolItem(string poolItemId, [FromBody] CreateTaskPoolItemRequest request)
    {
        var item = await _taskPoolService.UpdatePoolItemAsync(poolItemId, request);
        return Ok(item);
    }

    /// <summary>
    /// 删除任务库项
    /// </summary>
    [HttpDelete("{poolItemId}")]
    public async Task<IActionResult> DeletePoolItem(string poolItemId)
    {
        var result = await _taskPoolService.SoftDeletePoolItemAsync(poolItemId);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// 分配任务
    /// </summary>
    [HttpPost("{poolItemId}/assign")]
    public async Task<IActionResult> AssignTask(string poolItemId, [FromBody] AssignTaskRequest request)
    {
        var result = await _taskPoolService.AssignTaskAsync(poolItemId, request);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// 复制任务库项
    /// </summary>
    [HttpPost("{poolItemId}/duplicate")]
    public async Task<IActionResult> Duplicate(string poolItemId, [FromQuery] string? newTaskName, [FromQuery] DateTime? newDueDate)
    {
        var item = await _taskPoolService.DuplicateAsync(poolItemId, newTaskName, newDueDate);
        return CreatedAtAction(nameof(GetPoolItem), new { poolItemId = item.Id }, item);
    }

    /// <summary>
    /// 从任务回收
    /// </summary>
    [HttpPost("retrieve/{taskId}")]
    public async Task<IActionResult> RetrieveFromTask(string taskId)
    {
        var result = await _taskPoolService.RetrieveFromTaskAsync(taskId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// 批量分配任务
    /// 将多个任务库项分配为实际任务
    /// </summary>
    [HttpPost("batch-assign")]
    public async Task<IActionResult> BatchAssign([FromBody] BatchAssignRequest request)
    {
        if (request == null || request.PoolItemIds == null || request.PoolItemIds.Count == 0)
        {
            return BadRequest(new { success = false, error = "请求参数无效" });
        }

        var result = await _taskPoolService.BatchAssignAsync(request);
        return Ok(result);
    }
}
