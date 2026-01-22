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
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(string id)
    {
        var project = await _projectService.GetProjectByIdAsync(id);
        if (project == null)
            return NotFound();
        return Ok(project);
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
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(string id, [FromBody] UpdateProjectRequest request)
    {
        var project = await _projectService.UpdateProjectAsync(id, request);
        return Ok(project);
    }

    /// <summary>
    /// 删除项目
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(string id)
    {
        var result = await _projectService.SoftDeleteProjectAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// 检查项目是否在使用中
    /// </summary>
    [HttpGet("{id}/in-use")]
    public async Task<IActionResult> IsProjectInUse(string id)
    {
        var result = await _projectService.IsProjectInUseAsync(id);
        return Ok(new { InUse = result });
    }
}
