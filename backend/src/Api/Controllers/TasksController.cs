using Microsoft.AspNetCore.Mvc;
using R&DTaskSystem.Application.DTOs.Common;
using R&DTaskSystem.Application.DTOs.Tasks;
using R&DTaskSystem.Application.Interfaces;

namespace R&DTaskSystem.Api.Controllers;

/// <summary>
/// 任务管理控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<ApiResponse<PaginatedResponse<TaskDto>>>> GetTasks([FromQuery] TaskQueryParams query)
    {
        var result = await _taskService.GetTasksAsync(query);
        return Ok(new ApiResponse<PaginatedResponse<TaskDto>> { Success = true, Data = result });
    }

    /// <summary>
    /// 获取单个任务
    /// </summary>
    [HttpGet("{taskId}")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> GetTask(string taskId)
    {
        var task = await _taskService.GetTaskByIdAsync(taskId);
        if (task == null)
        {
            return NotFound(new ApiResponse<TaskDto> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "任务不存在" } });
        }

        return Ok(new ApiResponse<TaskDto> { Success = true, Data = task });
    }

    /// <summary>
    /// 创建任务
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskDto>>> CreateTask([FromBody] CreateTaskRequest request)
    {
        var task = await _taskService.CreateTaskAsync(request);
        return CreatedAtAction(nameof(GetTask), new { taskId = task.TaskID }, new ApiResponse<TaskDto> { Success = true, Data = task, Message = "创建成功" });
    }

    /// <summary>
    /// 更新任务
    /// </summary>
    [HttpPut("{taskId}")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> UpdateTask(string taskId, [FromBody] CreateTaskRequest request)
    {
        var task = await _taskService.UpdateTaskAsync(taskId, request);
        return Ok(new ApiResponse<TaskDto> { Success = true, Data = task, Message = "更新成功" });
    }

    /// <summary>
    /// 删除任务（软删除）
    /// </summary>
    [HttpDelete("{taskId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTask(string taskId)
    {
        var result = await _taskService.SoftDeleteTaskAsync(taskId);
        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "删除成功" })
            : NotFound(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "任务不存在" } });
    }

    /// <summary>
    /// 更新任务状态
    /// </summary>
    [HttpPatch("{taskId}/status")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> UpdateStatus(string taskId, [FromBody] string status)
    {
        var task = await _taskService.UpdateTaskStatusAsync(taskId, status);
        return Ok(new ApiResponse<TaskDto> { Success = true, Data = task, Message = "状态更新成功" });
    }

    /// <summary>
    /// 更新角色状态
    /// </summary>
    [HttpPatch("{taskId}/role-status")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> UpdateRoleStatus(string taskId, [FromBody] UpdateRoleStatusRequest request)
    {
        var task = await _taskService.UpdateRoleStatusAsync(taskId, request);
        return Ok(new ApiResponse<TaskDto> { Success = true, Data = task, Message = "角色状态更新成功" });
    }

    /// <summary>
    /// 完成任务所有角色
    /// </summary>
    [HttpPost("{taskId}/complete-all-roles")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> CompleteAllRoles(string taskId)
    {
        var task = await _taskService.CompleteAllRolesAsync(taskId);
        return Ok(new ApiResponse<TaskDto> { Success = true, Data = task, Message = "任务已完成" });
    }

    /// <summary>
    /// 回收任务到任务库
    /// </summary>
    [HttpPost("{taskId}/retrieve-to-pool")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> RetrieveToPool(string taskId)
    {
        var task = await _taskService.RetrieveToPoolAsync(taskId);
        return Ok(new ApiResponse<TaskDto> { Success = true, Data = task, Message = "已回收至任务库" });
    }

    /// <summary>
    /// 获取个人任务
    /// </summary>
    [HttpGet("personal")]
    public async Task<ActionResult<ApiResponse<PersonalTasksResponse>>> GetPersonalTasks([FromQuery] string userId)
    {
        var tasks = await _taskService.GetPersonalTasksAsync(userId);
        return Ok(new ApiResponse<PersonalTasksResponse> { Success = true, Data = tasks });
    }

    /// <summary>
    /// 获取差旅任务
    /// </summary>
    [HttpGet("travel")]
    public async Task<ActionResult<ApiResponse<TravelTasksResponse>>> GetTravelTasks([FromQuery] string userId, [FromQuery] string? period)
    {
        var tasks = await _taskService.GetTravelTasksAsync(userId, period);
        return Ok(new ApiResponse<TravelTasksResponse> { Success = true, Data = tasks });
    }

    /// <summary>
    /// 获取会议任务
    /// </summary>
    [HttpGet("meetings")]
    public async Task<ActionResult<ApiResponse<MeetingTasksResponse>>> GetMeetingTasks([FromQuery] string userId, [FromQuery] string? period)
    {
        var tasks = await _taskService.GetMeetingTasksAsync(userId, period);
        return Ok(new ApiResponse<MeetingTasksResponse> { Success = true, Data = tasks });
    }

    /// <summary>
    /// 检查是否为长期任务
    /// </summary>
    [HttpGet("{taskId}/is-long-running")]
    public async Task<ActionResult<ApiResponse<object>>> IsLongRunning(string taskId)
    {
        var isLongRunning = await _taskService.IsLongRunningTaskAsync(taskId);
        return Ok(new ApiResponse<object> { Success = true, Data = new { isLongRunning } });
    }

    /// <summary>
    /// 批量操作
    /// </summary>
    [HttpPost("batch")]
    public async Task<ActionResult<ApiResponse<object>>> BatchOperation([FromBody] BatchOperationRequest request)
    {
        await _taskService.BatchOperationAsync(request);
        return Ok(new ApiResponse<object> { Success = true, Message = "批量操作完成" });
    }
}
