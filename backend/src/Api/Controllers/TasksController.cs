using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TaskManageSystem.Application.DTOs.Tasks;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 任务控制器 (TasksController)
///
/// 概述:
/// - 提供任务管理的RESTful API端点
/// - 所有接口都需要JWT认证（[Authorize]）
/// - 支持任务CRUD、个人任务查询、角色状态管理等功能
///
/// 路由规则:
/// - 基础路由: /api/tasks
/// - GET /api/tasks - 获取任务列表（支持分页和过滤）
/// - GET /api/tasks/{taskId} - 获取单个任务详情
/// - POST /api/tasks - 创建新任务
/// - PUT /api/tasks/{taskId} - 更新任务
/// - DELETE /api/tasks/{taskId} - 删除任务（软删除）
///
/// 特殊端点:
/// - GET /api/tasks/personal/{userId} - 获取某用户的个人任务
/// - GET /api/tasks/travel/{userId} - 获取差旅任务
/// - GET /api/tasks/meeting/{userId} - 获取会议任务
/// - PUT /api/tasks/{taskId}/status - 更新任务整体状态
/// - PUT /api/tasks/{taskId}/role-status - 更新角色状态
/// - POST /api/tasks/{taskId}/complete-all - 完成所有角色
/// - POST /api/tasks/{taskId}/retrieve - 回收任务到任务库
/// - POST /api/tasks/batch - 批量操作任务
/// </summary>
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    /// <summary>
    /// 构造函数 - 通过依赖注入获取任务服务
    /// </summary>
    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>
    /// 获取任务列表
    /// 支持按任务分类、负责人、项目、状态等条件过滤
    /// </summary>
    /// <param name="query">查询参数（分页、过滤条件）</param>
    /// <returns>分页的任务列表</returns>
    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] TaskQueryParams query)
    {
        var result = await _taskService.GetTasksAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// 获取单个任务详情
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <returns>任务详情或404</returns>
    [HttpGet("{taskId}")]
    public async Task<IActionResult> GetTask(string taskId)
    {
        var task = await _taskService.GetTaskByIdAsync(taskId);
        if (task == null)
            return NotFound();
        return Ok(task);
    }

    /// <summary>
    /// 创建新任务
    /// 会根据任务类型（会议培训/差旅）自动设置初始状态
    /// </summary>
    /// <param name="request">创建任务请求体</param>
    /// <returns>创建的任务</returns>
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        try
        {
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
    /// 更新任务信息
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <param name="request">更新请求体</param>
    /// <returns>更新后的任务</returns>
    [HttpPut("{taskId}")]
    public async Task<IActionResult> UpdateTask(string taskId, [FromBody] CreateTaskRequest request)
    {
        try
        {
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
    /// 删除任务（软删除）
    /// 实际上是将任务的IsDeleted字段设为true
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <returns>204 NoContent 或 404 NotFound</returns>
    [HttpDelete("{taskId}")]
    public async Task<IActionResult> DeleteTask(string taskId)
    {
        var result = await _taskService.SoftDeleteTaskAsync(taskId);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// 更新任务整体状态
    /// 支持PUT和PATCH两种HTTP方法
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <param name="request">状态更新请求</param>
    /// <returns>更新后的任务</returns>
    [HttpPut("{taskId}/status")]
    [HttpPatch("{taskId}/status")]
    public async Task<IActionResult> UpdateTaskStatus(string taskId, [FromBody] UpdateTaskStatusRequest request)
    {
        var task = await _taskService.UpdateTaskStatusAsync(taskId, request.Status);
        return Ok(task);
    }

    /// <summary>
    /// 更新任务中特定角色的状态
    /// 角色包括：负责人(assignee)、校核人(checker)、主任设计(chiefDesigner)、审查人(approver)
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <param name="request">角色状态更新请求</param>
    /// <returns>更新后的任务</returns>
    [HttpPut("{taskId}/role-status")]
    [HttpPatch("{taskId}/role-status")]
    public async Task<IActionResult> UpdateRoleStatus(string taskId, [FromBody] UpdateRoleStatusRequest request)
    {
        var task = await _taskService.UpdateRoleStatusAsync(taskId, request);
        return Ok(task);
    }

    /// <summary>
    /// 完成任务的所有角色
    /// 将负责人、校核人、主任设计、审查人的状态都设为已完成
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <returns>更新后的任务</returns>
    [HttpPost("{taskId}/complete-all")]
    public async Task<IActionResult> CompleteAllRoles(string taskId)
    {
        var task = await _taskService.CompleteAllRolesAsync(taskId);
        return Ok(task);
    }

    /// <summary>
    /// 将任务回收到任务库
    /// 将已分配的任务恢复为任务库中的计划任务
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <returns>更新后的任务</returns>
    [HttpPost("{taskId}/retrieve")]
    public async Task<IActionResult> RetrieveToPool(string taskId)
    {
        var task = await _taskService.RetrieveToPoolAsync(taskId);
        return Ok(task);
    }

    /// <summary>
    /// 获取指定用户的个人任务
    /// 按状态分组返回：进行中、待开始、已完成
    /// </summary>
    /// <param name="userId">用户ID</param>
    /// <returns>分组的任务列表</returns>
    [HttpGet("personal/{userId}")]
    public async Task<IActionResult> GetPersonalTasks(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new
            {
                success = false,
                error = new { code = "INVALID_PARAMETER", message = "userId参数为必填项" }
            });
        }

        var tasks = await _taskService.GetPersonalTasksAsync(userId);
        return Ok(new
        {
            success = true,
            data = tasks,
            message = (string?)null,
            error = (object?)null
        });
    }

    /// <summary>
    /// 获取指定用户的差旅任务
    /// 任务类别为TC009（差旅任务）
    /// </summary>
    /// <param name="userId">用户ID</param>
    /// <param name="period">可选的时间周期</param>
    /// <returns>差旅任务列表</returns>
    [HttpGet("travel/{userId}")]
    public async Task<IActionResult> GetTravelTasks(string userId, [FromQuery] string? period)
    {
        var tasks = await _taskService.GetTravelTasksAsync(userId, period);
        return Ok(tasks);
    }

    /// <summary>
    /// 获取指定用户的会议任务
    /// 任务类别为TC007（会议培训任务）
    /// </summary>
    /// <param name="userId">用户ID</param>
    /// <param name="period">可选的时间周期</param>
    /// <returns>会议任务列表</returns>
    [HttpGet("meeting/{userId}")]
    public async Task<IActionResult> GetMeetingTasks(string userId, [FromQuery] string? period)
    {
        var tasks = await _taskService.GetMeetingTasksAsync(userId, period);
        return Ok(tasks);
    }

    /// <summary>
    /// 检查任务是否为长期任务
    /// 长期任务定义：开始日期到截止日期超过30天
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <returns>是否为长期任务</returns>
    [HttpGet("{taskId}/is-long-running")]
    public async Task<IActionResult> IsLongRunningTask(string taskId)
    {
        var result = await _taskService.IsLongRunningTaskAsync(taskId);
        return Ok(new { IsLongRunning = result });
    }

    /// <summary>
    /// 批量操作任务
    /// 支持批量更新状态、批量删除等操作
    /// </summary>
    /// <param name="request">批量操作请求</param>
    /// <returns>操作结果</returns>
    [HttpPost("batch")]
    public async Task<IActionResult> BatchOperation([FromBody] BatchOperationRequest request)
    {
        await _taskService.BatchOperationAsync(request);
        return Ok(new { Success = true });
    }
}
