using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.Projects;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 项目控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    /// <summary>
    /// 获取项目列表
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProjects([FromQuery] ProjectQueryParams query)
    {
        var result = await _projectService.GetProjectsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// 获取项目统计
    /// </summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics([FromQuery] string? category)
    {
        var result = await _projectService.GetStatisticsAsync(category);
        return Ok(result);
    }

    /// <summary>
    /// 获取单个项目
    /// </summary>
    [HttpGet("{projectId}")]
    public async Task<IActionResult> GetProject(string projectId)
    {
        var project = await _projectService.GetProjectByIdAsync(projectId);
        if (project == null)
        {
            return NotFound(new
            {
                success = false,
                error = new { code = "NOT_FOUND", message = $"项目 {projectId} 不存在" }
            });
        }
        return Ok(new
        {
            success = true,
            data = project,
            message = (string?)null,
            error = (object?)null
        });
    }

    /// <summary>
    /// 创建项目
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
    {
        var project = await _projectService.CreateProjectAsync(request);
        return Ok(project);
    }

    /// <summary>
    /// 更新项目
    /// </summary>
    [HttpPut("{projectId}")]
    public async Task<IActionResult> UpdateProject(string projectId, [FromBody] UpdateProjectRequest request)
    {
        var project = await _projectService.UpdateProjectAsync(projectId, request);
        return Ok(project);
    }

    /// <summary>
    /// 删除项目
    /// </summary>
    [HttpDelete("{projectId}")]
    public async Task<IActionResult> DeleteProject(string projectId)
    {
        try
        {
            var result = await _projectService.SoftDeleteProjectAsync(projectId);
            if (!result)
            {
                return NotFound(new
                {
                    success = false,
                    error = new { code = "NOT_FOUND", message = $"项目 {projectId} 不存在或已被删除" }
                });
            }
            return Ok(new { success = true, message = "项目删除成功" });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                error = new { code = "DELETE_FAILED", message = $"删除失败: {ex.Message}" }
            });
        }
    }

    /// <summary>
    /// 检查项目是否在使用中
    /// </summary>
    [HttpGet("{projectId}/in-use")]
    public async Task<IActionResult> IsProjectInUse(string projectId)
    {
        var result = await _projectService.IsProjectInUseAsync(projectId);
        return Ok(new { InUse = result });
    }
}
