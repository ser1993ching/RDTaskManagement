using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TaskManageSystem.Application.DTOs.Tasks;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 任务控制器
/// </summary>
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>
    /// 获取任务列表
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] TaskQueryParams query)
    {
        var result = await _taskService.GetTasksAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// 获取单个任务
    /// </summary>
    [HttpGet("{taskId}")]
    public async Task<IActionResult> GetTask(string taskId)
    {
        var task = await _taskService.GetTaskByIdAsync(taskId);
        if (task == null)
            return NotFound();
        return Ok(task);
    }

    /// <summary>
    /// 创建任务
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateTask()
    {
        try
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var request = JsonSerializer.Deserialize<CreateTaskRequest>(body, options);

            if (request == null)
            {
                return BadRequest(new { success = false, error = "无法解析请求体" });
            }

            var task = await _taskService.CreateTaskAsync(request);
            return Ok(task);
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// 更新任务
    /// </summary>
    [HttpPut("{taskId}")]
    public async Task<IActionResult> UpdateTask(string taskId)
    {
        try
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var request = JsonSerializer.Deserialize<CreateTaskRequest>(body, options);

            if (request == null)
            {
                return BadRequest(new { success = false, error = "无法解析请求体" });
            }

            var task = await _taskService.UpdateTaskAsync(taskId, request);
            return Ok(task);
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// 删除任务
    /// </summary>
    [HttpDelete("{taskId}")]
    public async Task<IActionResult> DeleteTask(string taskId)
    {
        var result = await _taskService.SoftDeleteTaskAsync(taskId);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// 更新任务状态
    /// </summary>
    [HttpPatch("{taskId}/status")]
    public async Task<IActionResult> UpdateTaskStatus(string taskId, [FromBody] string status)
    {
        var task = await _taskService.UpdateTaskStatusAsync(taskId, status);
        return Ok(task);
    }

    /// <summary>
    /// 更新角色状态
    /// </summary>
    [HttpPatch("{taskId}/role-status")]
    public async Task<IActionResult> UpdateRoleStatus(string taskId, [FromBody] UpdateRoleStatusRequest request)
    {
        var task = await _taskService.UpdateRoleStatusAsync(taskId, request);
        return Ok(task);
    }

    /// <summary>
    /// 完成所有角色
    /// </summary>
    [HttpPost("{taskId}/complete-all")]
    public async Task<IActionResult> CompleteAllRoles(string taskId)
    {
        var task = await _taskService.CompleteAllRolesAsync(taskId);
        return Ok(task);
    }

    /// <summary>
    /// 回收任务到任务库
    /// </summary>
    [HttpPost("{taskId}/retrieve")]
    public async Task<IActionResult> RetrieveToPool(string taskId)
    {
        var task = await _taskService.RetrieveToPoolAsync(taskId);
        return Ok(task);
    }

    /// <summary>
    /// 获取个人任务
    /// </summary>
    [HttpGet("personal/{userId}")]
    public async Task<IActionResult> GetPersonalTasks(string userId)
    {
        var tasks = await _taskService.GetPersonalTasksAsync(userId);
        return Ok(tasks);
    }

    /// <summary>
    /// 获取差旅任务
    /// </summary>
    [HttpGet("travel/{userId}")]
    public async Task<IActionResult> GetTravelTasks(string userId, [FromQuery] string? period)
    {
        var tasks = await _taskService.GetTravelTasksAsync(userId, period);
        return Ok(tasks);
    }

    /// <summary>
    /// 获取会议任务
    /// </summary>
    [HttpGet("meeting/{userId}")]
    public async Task<IActionResult> GetMeetingTasks(string userId, [FromQuery] string? period)
    {
        var tasks = await _taskService.GetMeetingTasksAsync(userId, period);
        return Ok(tasks);
    }

    /// <summary>
    /// 检查是否为长期任务
    /// </summary>
    [HttpGet("{taskId}/is-long-running")]
    public async Task<IActionResult> IsLongRunningTask(string taskId)
    {
        var result = await _taskService.IsLongRunningTaskAsync(taskId);
        return Ok(new { IsLongRunning = result });
    }

    /// <summary>
    /// 批量操作
    /// </summary>
    [HttpPost("batch")]
    public async Task<IActionResult> BatchOperation([FromBody] BatchOperationRequest request)
    {
        await _taskService.BatchOperationAsync(request);
        return Ok(new { Success = true });
    }
}
